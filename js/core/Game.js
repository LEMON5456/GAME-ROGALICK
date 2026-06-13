import { Input } from './Input.js';
import { Camera } from './Camera.js';
import { Timer } from './Timer.js';
import { Player } from '../entities/Player.js';
import { generatePlanet, generateBossArena } from '../world/PlanetGen.js';
import { createBoss } from '../entities/Boss.js';
import { MiningSystem, checkEvacuation, checkHazardDamage } from '../systems/Mining.js';
import { CombatSystem, updateProjectiles } from '../systems/Combat.js';
import { setupPlanetEnemies } from '../systems/Spawn.js';
import { HUD } from '../ui/HUD.js';
import { ShopUI } from '../ui/ShopUI.js';
import { MenuUI } from '../ui/MenuUI.js';
import { MetaShopUI } from '../ui/MetaShopUI.js';
import { PLANETS, BOSS_PLANET, getPlanetsForSector, getSectorInfo } from '../data/planets.js';
import { COLORS, PLANET_TIMER } from '../constants.js';
import { placeEntitySafely, isOnGround } from '../world/Physics.js';
import { SaveManager } from './SaveManager.js';
import { audio } from './Audio.js';
import { getBiome } from '../data/biomes.js';
import { spawnMineParticles, spawnDeathParticles, spawnMuzzleFlash } from '../entities/Particle.js';

const STATE = {
  MENU: 'menu',
  HUB: 'hub',
  PLANET: 'planet',
  SHOP: 'shop',
  BOSS: 'boss',
  GAME_OVER: 'gameover',
  WIN: 'win',
};

function createRunState() {
  return {
    oreBank: { iron: 0, crystal: 0 },
    sessionOre: { iron: 0, crystal: 0 },
    upgradeLevels: { blaster: 0, drill: 0, suit: 0, stabilizer: 0 },
    damageMult: 1,
    miningSpeedMult: 1,
    timerBonus: 0,
    hp: 100,
    maxHp: 100,
    planetIndex: 0,
    phase: 'planets',
    sector: 'sector1',
    shopDiscount: 0,
  };
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.input = new Input(canvas);
    this.camera = new Camera(window.innerWidth, window.innerHeight);
    this.player = new Player();
    this.planetTimer = new Timer(PLANET_TIMER);
    this.mining = new MiningSystem();
    this.combat = new CombatSystem();
    this.hud = new HUD();

    this.state = STATE.MENU;
    this.run = null;
    this.map = null;
    this.enemies = [];
    this.projectiles = [];
    this.boss = null;
    this.planetConfig = null;
    this.time = 0;
    this.pendingAction = null;
    this.hubMessage = '';
    this.particles = [];
    this.sectorInfo = null;
    this.biome = 'space';

    this.meta = SaveManager.load();

    this.menuUI = new MenuUI({
      onStart: () => this.startRun(),
      onDeploy: () => this.deploy(),
      onRetry: () => this.startRun(),
      onSector2: () => this.startSector2(),
    });

    this.shopUI = new ShopUI(() => this.afterShop());
    this.metaShopUI = new MetaShopUI(() => {});
    this.resize();

    this._setupVolumeSlider();
  }

  _setupVolumeSlider() {
    const slider = document.getElementById('volume-slider');
    if (slider) {
      slider.value = this.meta.settings.musicVolume * 100;
      slider.addEventListener('input', () => {
        const v = parseFloat(slider.value) / 100;
        audio.setMusicVolume(v);
        this.meta.settings.musicVolume = v;
        SaveManager.save(this.meta);
      });
    }
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.camera.resize(w, h);
  }

  startRun() {
    audio.init();
    audio.ensureResumed();
    this.meta = SaveManager.load();
    this.run = createRunState();
    SaveManager.applyMetaUpgrades(this.run, this.meta);
    this.player.reset();
    this.run.hp = this.run.maxHp;
    this.state = STATE.HUB;
    this.run.sector = 'sector1';
    this.sectorInfo = getSectorInfo('sector1');
    this.biome = this.sectorInfo.biome;
    this.hubMessage = 'Первая высадка: ' + this.sectorInfo.planets[0].name;
    this.menuUI.showHub(this.run, this.hubMessage, this.sectorInfo.name);
    this.hud.hide();
    this.particles = [];
    audio.setBiome(this.biome);
    audio.startMusic(this.biome);
  }

  deploy() {
    this.menuUI.hideAll();
    this.canvas.focus();
    if (this.run.phase === 'boss') {
      this.loadBoss();
    } else {
      this.loadPlanet(this.run.planetIndex);
    }
  }

  loadPlanet(index) {
    const planets = getPlanetsForSector(this.run.sector);
    this.planetConfig = planets[index];
    this.sectorInfo = getSectorInfo(this.run.sector);
    this.biome = this.sectorInfo.biome;
    this.map = generatePlanet(this.planetConfig, this.biome);
    this.camera.setWorldSize(this.map.width, this.map.height);
    placeEntitySafely(this.player, this.map, this.map.spawnX, this.map.spawnY);
    this.player.hp = this.run.hp;
    this.player.maxHp = this.run.maxHp;
    this.player.grounded = isOnGround(this.player, this.map);
    this.camera.snapTo(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);
    this.enemies = setupPlanetEnemies(this.planetConfig, this.map);
    this.projectiles = [];
    this.boss = null;
    this.mining.reset();
    this.planetTimer.start(PLANET_TIMER + this.run.timerBonus);
    this.run.sessionOre = { iron: 0, crystal: 0 };
    this.state = STATE.PLANET;
    this.hud.show();
    this.particles = [];
    audio.setBiome(this.biome);
  }

  loadBoss() {
    this.planetConfig = BOSS_PLANET;
    this.map = generateBossArena();
    this.camera.setWorldSize(this.map.width, this.map.height);
    placeEntitySafely(this.player, this.map, this.map.spawnX, this.map.spawnY);
    this.player.hp = this.run.hp;
    this.player.maxHp = this.run.maxHp;
    this.player.grounded = isOnGround(this.player, this.map);
    this.camera.snapTo(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);
    this.enemies = [];
    this.projectiles = [];
    this.boss = createBoss(this.map);
    this.mining.reset();
    this.planetTimer.stop();
    this.run.sessionOre = { iron: 0, crystal: 0 };
    this.state = STATE.BOSS;
    this.hud.show();
    this.particles = [];
  }

  finishPlanet() {
    this.run.oreBank.iron += this.run.sessionOre.iron;
    this.run.oreBank.crystal += this.run.sessionOre.crystal;

    const etherReward = 5;
    SaveManager.awardEtherSerum(this.meta, etherReward);
    SaveManager.recordRunEnd(this.meta, 'evacuate', this.run.sessionOre.iron + this.run.sessionOre.crystal);

    this.run.sessionOre = { iron: 0, crystal: 0 };
    this.run.hp = this.player.hp;

    const planets = getPlanetsForSector(this.run.sector);
    this.run.planetIndex++;
    if (this.run.planetIndex >= planets.length) {
      this.run.phase = 'boss';
      this.state = STATE.SHOP;
      this.hud.hide();
      this.shopUI.show(this.run);
    } else {
      this.state = STATE.SHOP;
      this.hud.hide();
      this.shopUI.show(this.run);
    }
    audio.sfxEvacuate();
  }

  afterShop() {
    if (this.run.phase === 'boss') {
      this.hubMessage = 'Финальная миссия: ' + BOSS_PLANET.name;
      this.state = STATE.HUB;
      this.menuUI.showHub(this.run, this.hubMessage, this.sectorInfo.name);
    } else {
      const planets = getPlanetsForSector(this.run.sector);
      this.hubMessage = 'Следующая высадка: ' + planets[this.run.planetIndex].name;
      this.state = STATE.HUB;
      this.menuUI.showHub(this.run, this.hubMessage, this.sectorInfo.name);
    }
  }

  onDeath() {
    this.state = STATE.GAME_OVER;
    this.hud.hide();
    this.menuUI.showGameOver();
    SaveManager.recordRunEnd(this.meta, 'lose', 0);
    audio.sfxLose();
    audio.stopMusic();
  }

  onWin() {
    this.state = STATE.WIN;
    this.hud.hide();
    const etherReward = 50;
    SaveManager.awardEtherSerum(this.meta, etherReward);
    SaveManager.recordRunEnd(this.meta, 'win', this.run.oreBank.iron + this.run.oreBank.crystal);
    this.meta = SaveManager.load();
    const sector2Unlocked = this.meta.stats.sector2Unlocked;
    this.menuUI.showWin(sector2Unlocked);
    audio.sfxWin();
    audio.stopMusic();
  }

  startSector2() {
    this.run = createRunState();
    SaveManager.applyMetaUpgrades(this.run, this.meta);
    this.player.reset();
    this.run.hp = this.run.maxHp;
    this.run.sector = 'sector2';
    this.sectorInfo = getSectorInfo('sector2');
    this.biome = this.sectorInfo.biome;
    this.run.planetIndex = 0;
    this.run.phase = 'planets';
    this.state = STATE.HUB;
    this.hubMessage = 'Первая высадка: ' + this.sectorInfo.planets[0].name;
    this.menuUI.showHub(this.run, this.hubMessage, this.sectorInfo.name);
    this.hud.hide();
    this.particles = [];
    audio.setBiome(this.biome);
    audio.startMusic(this.biome);
  }

  update(dt) {
    this.time += dt;

    if (this.state === STATE.PLANET || this.state === STATE.BOSS) {
      this.updateGameplay(dt);
    }

    this.input.endFrame();
  }

  updateGameplay(dt) {
    this.player.update(this.input, this.map, dt, this.run);

    if (this.input.fireHeld()) {
      const muzzle = this.player.tryFire(this.projectiles, this.camera);
      if (muzzle) {
        spawnMuzzleFlash(muzzle.x, muzzle.y, this.particles);
        audio.sfxShoot();
      }
    }

    if (this.state === STATE.PLANET) {
      const expired = this.planetTimer.update(dt);
      if (expired) {
        this.finishPlanet();
        return;
      }

      const mined = this.mining.update(this.input, this.player, this.map, this.run, dt);
      if (mined) {
        this.run.sessionOre[mined.type] += mined.amount;
        const px = this.player.x + this.player.w / 2;
        const py = this.player.y + this.player.h / 2;
        spawnMineParticles(px, py, mined.type === 'iron' ? '#c87020' : '#40c8e8', this.particles);
      }

      if (this.input.action() && checkEvacuation(this.player, this.map)) {
        const oreNear = this.mining.findNearbyOre(this.player, this.map);
        if (!oreNear) {
          this.finishPlanet();
          return;
        }
      }

      const hazardDmg = checkHazardDamage(this.player, this.map);
      if (hazardDmg > 0 && (this.combat.hazardTimer || 0) <= 0) {
        this.combat.hazardTimer = 0.5;
        if (this.player.takeDamage(hazardDmg)) {
          this.run.hp = 0;
          this.onDeath();
          return;
        }
        audio.sfxHurt();
      }
    }

    for (const e of this.enemies) {
      e.update(dt, this.map, this.player, this.projectiles);
    }
    if (this.boss) {
      this.boss.update(dt, this.map, this.player, this.projectiles, this.enemies);
      if (this.boss.phaseChanged) {
        this.boss.phaseChanged = false;
        audio.sfxBossPhase();
      }
      if (this.boss.defeated) {
        spawnDeathParticles(this.boss.x, this.boss.y, this.boss.w, this.boss.h, '#40c060', this.particles);
        this.onWin();
        return;
      }
    }

    for (const e of this.enemies) {
      if (e.dead) {
        spawnDeathParticles(e.x, e.y, e.w, e.h, e.type === 'crawler' ? '#e04040' : '#a040e0', this.particles);
        if (e.etherDrop > 0) {
          SaveManager.awardEtherSerum(this.meta, e.etherDrop);
          this.meta = SaveManager.load();
        }
      }
    }

    this.enemies = this.enemies.filter((e) => !e.dead);
    this.projectiles = updateProjectiles(this.projectiles, this.map, dt);

    this.particles = this.particles.filter((p) => !p.dead);
    for (const p of this.particles) p.update(dt);

    const result = this.combat.update(this.player, this.enemies, this.boss, this.projectiles, this.run, dt);
    if (result === 'death') {
      this.run.hp = 0;
      this.onDeath();
      return;
    }

    this.run.hp = this.player.hp;
    this.camera.follow(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, dt);

    this.hud.update(
      this.player,
      this.run,
      this.planetTimer,
      this.mining.getProgress(),
      this.state === STATE.PLANET
    );
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const bc = getBiome(this.biome);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, bc.sky1);
    grad.addColorStop(1, bc.sky2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (this.state !== STATE.PLANET && this.state !== STATE.BOSS) return;

    this.renderBackground(ctx, bc);
    this.camera.apply(ctx);
    this.map.render(ctx, this.camera);
    this.map.renderMarkers(ctx, this.time);

    for (const e of this.enemies) e.render(ctx);
    if (this.boss) this.boss.render(ctx, this.time);
    this.player.render(ctx, this.time);
    for (const p of this.projectiles) p.render(ctx);
    for (const p of this.particles) p.render(ctx);

    this.camera.restore(ctx);

    if (this.state === STATE.BOSS) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Победите Mould Titan!', this.canvas.width / 2, 30);
    } else if (this.planetConfig) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(this.planetConfig.name, 16, 24);
    }
  }

  renderBackground(ctx, bc) {
    const parallax1 = this.camera.x * 0.2;
    const parallax2 = this.camera.x * 0.4;

    const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, bc.sky1);
    grad.addColorStop(1, bc.sky2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = bc.parallaxColor1;
    ctx.fillRect(-parallax1 % 200 - 50, 80, 120, 40);
    ctx.fillRect(-parallax1 % 200 + 150, 120, 80, 30);

    ctx.fillStyle = bc.parallaxColor2;
    ctx.fillRect(-parallax2 % 300 - 80, 160, 160, 50);
  }
}
