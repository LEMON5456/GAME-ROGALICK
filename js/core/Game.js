import { Input } from './Input.js';
import { Camera } from './Camera.js';
import { Timer } from './Timer.js';
import { Player } from '../entities/Player.js';
import { generatePlanet, generateBossArena } from '../world/PlanetGen.js';
import { createBoss } from '../entities/Boss.js';
import { createLavaBoss } from '../entities/LavaBoss.js';
import { createIceBoss } from '../entities/IceBoss.js';
import { MiningSystem, checkEvacuation, checkHazardDamage } from '../systems/Mining.js';
import { CombatSystem, updateProjectiles } from '../systems/Combat.js';
import { setupPlanetEnemies } from '../systems/Spawn.js';
import { WaveManager } from '../systems/WaveManager.js';
import { HUD } from '../ui/HUD.js';
import { ShopUI } from '../ui/ShopUI.js';
import { MenuUI } from '../ui/MenuUI.js';
import { MetaShopUI } from '../ui/MetaShopUI.js';
import { PauseUI } from '../ui/PauseUI.js';
import { BOSS_PLANET, ICE_BOSS_PLANET, LAVA_BOSS_PLANET, getPlanetsForSector, getSectorInfo } from '../data/planets.js';
import { COLORS, PLANET_TIMER, TILE, TILE_SIZE, TUNNEL } from '../constants.js';
import { placeEntitySafely, isOnGround, aabbOverlap } from '../world/Physics.js';
import { SaveManager } from './SaveManager.js';
import { audio } from './Audio.js';
import { iceTiles } from './IceTiles.js';
import { Lighting } from './Lighting.js';
import { getBiome } from '../data/biomes.js';
import { renderProjectile } from '../entities/Projectile.js';
import { spawnMineParticles, spawnDeathParticles, spawnMuzzleFlash, spawnLandingParticles, spawnSnow, spawnEmbers } from '../entities/Particle.js';
import { Pickup } from '../entities/Pickup.js';
import { Crate } from '../entities/Crate.js';
import { generateEvents, initEventEnemy } from '../events/RandomEvents.js';
import { FloatingText } from '../entities/FloatingText.js';
import { BackgroundImage } from './BackgroundImage.js';
import { fxSheets } from './FXSheets.js';

const STATE = {
  MENU: 'menu',
  HUB: 'hub',
  PLANET: 'planet',
  SHOP: 'shop',
  BOSS: 'boss',
  GAME_OVER: 'gameover',
  WIN: 'win',
  PAUSED: 'paused',
};

function createRunState() {
  return {
    oreBank: { iron: 0, crystal: 0 },
    sessionOre: { iron: 0, crystal: 0 },
    upgradeLevels: { blaster: 0, drill: 0, suit: 0, stabilizer: 0, multiShot: 0, fireRate: 0, homing: 0, jump: 0 },
    damageMult: 1,
    miningSpeedMult: 1,
    timerBonus: 0,
    hp: 100,
    maxHp: 100,
    planetIndex: 0,
    phase: 'planets',
    sector: 'sector1',
    shopDiscount: 0,
    kills: 0,
    multiShot: 1,
    fireRateMult: 1,
    homing: 0,
    jumpMult: 1,
    multiMineCount: 1,
    endless: false,
    perkChosen: false,
    vampirism: 0,
    oreBonus: 0,
    orePenalty: 0,
    etherMult: 1,
    speedMult: 1,
    defense: 0,
    etherPerPlanet: 0,
    timerPenalty: 1,
    enemySpeedMult: 1,
    enemyHpMult: 1,
    darknessMult: 1,
    dailyMutator: null,
  };
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.input = new Input(canvas);
    this.camera = new Camera(window.innerWidth, window.innerHeight);
    this.lighting = new Lighting(canvas);
    this.player = new Player();
    this.planetTimer = new Timer(PLANET_TIMER);
    this.mining = new MiningSystem();
    this.combat = new CombatSystem();
    this.waveManager = new WaveManager();
    this.hud = new HUD();

    this.state = STATE.MENU;
    this.run = null;
    this.map = null;
    this.enemies = [];
    this.pickups = [];
    this._projectilePool = [];
    this.projectiles = [];
    this._clearPool = () => {
      this._projectilePool.push(...this.projectiles);
      this.projectiles.length = 0;
    };
    this.boss = null;
    this.planetConfig = null;
    this.time = 0;
    this.crates = [];
    this.pendingAction = null;
    this.hubMessage = '';
    this.particles = [];
    this._impacts = [];
    this.snowParticles = [];

    this.sectorInfo = null;
    this.biome = 'space';

    this.meta = SaveManager.load();
    this._playerWasGrounded = false;
    this._landed = false;
    this.heartbeatTimer = 3;
    this._mapVisible = false;
    this._prevMapPressed = false;
    this._fadeAlpha = 0;
    this._fadeDir = 0;
    this._pendingFadeCallback = null;
    this.floatingTexts = [];
    this.events = [];
    this.bgImage = new BackgroundImage();

    this.menuUI = new MenuUI({
      onStart: () => this.startRun(),
      onDaily: (mutator) => this.startRun(mutator),
      onDeploy: () => this.deploy(),
      onRetry: () => this.startRun(),
      onSector2: () => this.startSector('sector2'),
      onSector3: () => this.startSector('sector3'),
      onEndless: () => this.startSector('endless'),
    });

    this.shopUI = new ShopUI(() => this.afterShop());
    this.metaShopUI = new MetaShopUI(() => {});
    this.pauseUI = new PauseUI(
      () => this._resume(),
      () => this._quitToMenu(),
    );
    this.resize();

    this._setupVolumeSlider();
  }

  _setupVolumeSlider() {
    const setVolume = (v) => {
      audio.setMusicVolume(v);
      this.meta.settings.musicVolume = v;
      SaveManager.save(this.meta);
    };
    const slider = document.getElementById('volume-slider');
    if (slider) {
      slider.value = this.meta.settings.musicVolume * 100;
      slider.addEventListener('input', () => setVolume(parseFloat(slider.value) / 100));
    }
    const pauseSlider = document.getElementById('pause-volume-slider');
    if (pauseSlider) {
      pauseSlider.value = this.meta.settings.musicVolume * 100;
      pauseSlider.addEventListener('input', () => setVolume(parseFloat(pauseSlider.value) / 100));
    }

    const setSfxVolume = (v) => {
      audio.setSfxVolume(v);
      this.meta.settings.sfxVolume = v;
      SaveManager.save(this.meta);
    };
    const sfxSlider = document.getElementById('sfx-volume-slider');
    if (sfxSlider) {
      sfxSlider.value = (this.meta.settings.sfxVolume || 0.5) * 100;
      sfxSlider.addEventListener('input', () => setSfxVolume(parseFloat(sfxSlider.value) / 100));
    }
    const pauseSfx = document.getElementById('pause-sfx-slider');
    if (pauseSfx) {
      pauseSfx.value = (this.meta.settings.sfxVolume || 0.5) * 100;
      pauseSfx.addEventListener('input', () => setSfxVolume(parseFloat(pauseSfx.value) / 100));
    }

    document.querySelectorAll('.panel button').forEach(btn => {
      btn.addEventListener('click', () => audio.sfxClick());
    });
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.camera.resize(w, h);
    this.lighting.resize(w, h);
  }

  fadeTransition(callback) {
    if (this._fadeDir !== 0) {
      this._pendingFadeCallback = callback;
      return;
    }
    this._fadeDir = 1;
    this._fadeCallback = callback;
  }

  updateFade(dt) {
    if (this._fadeDir === 0) {
      if (this._pendingFadeCallback) {
        const cb = this._pendingFadeCallback;
        this._pendingFadeCallback = null;
        this.fadeTransition(cb);
      }
      return;
    }
    const speed = 3;
    this._fadeAlpha += this._fadeDir * speed * dt;
    if (this._fadeAlpha >= 1) {
      this._fadeAlpha = 1;
      this._fadeDir = -1;
      if (this._fadeCallback) {
        this._fadeCallback();
        this._fadeCallback = null;
      }
    } else if (this._fadeAlpha <= 0) {
      this._fadeAlpha = 0;
      this._fadeDir = 0;
    }
  }

  startRun(mutator) {
    audio.init();
    audio.ensureResumed();
    this.meta = SaveManager.load();
    this.run = createRunState();
    if (mutator) {
      this.run.dailyMutator = mutator;
      mutator.apply(this.run);
    }
    SaveManager.applyMetaUpgrades(this.run, this.meta);
    this.player.reset();
    this.run.hp = this.run.maxHp;
    this.state = STATE.HUB;
    this.run.sector = 'sector1';
    this.sectorInfo = getSectorInfo('sector1');
    this.biome = this.sectorInfo.biome;
    this.hubMessage = 'Первая высадка: ' + this.sectorInfo.planets[0].name;
    this.menuUI.showHub(this.run, this.hubMessage, this.sectorInfo.name, this.sectorInfo.biome);
    this.hud.hide();
    this.particles = [];
    this.pickups = [];
    this.snowParticles = [];
    this.events = [];
    audio.setBiome(this.biome);

    const img = new Image();
    img.onload = () => { this.bgImage._images['space'] = img; this.bgImage._loaded['space'] = true; };
    img.onerror = () => { console.error('sector1 bg FAILED'); };
    img.src = 'assets/backgrounds/bg_sector1.jpg';

    audio.startMusic(this.biome);
  }

  spawnProjectile(cx, cy, dirX, speed, owner, vy = 0, homing = 0) {
    let p = this._projectilePool.pop();
    if (!p) p = { w: 10, h: 6, dead: true };
    p.x = cx - p.w / 2;
    p.y = cy - p.h / 2;
    p.vx = dirX * speed;
    p.vy = vy;
    p.owner = owner;
    p.biome = this.biome;
    p.dead = false;
    p.gravity = owner === 'boss' ? 400 : 0;
    p.homing = homing;
    this.projectiles.push(p);
    if (this.projectiles.length > 80) {
      this.projectiles[0].dead = true;
    }
    return p;
  }

  deploy() {
    this.menuUI.hideAll();
    this.canvas.focus();
    audio.sfxDeploy();
    this.fadeTransition(() => {
      if (this.run.phase === 'boss') {
        this.loadBoss();
      } else {
        this.loadPlanet(this.run.planetIndex);
      }
    });
  }

  loadPlanet(index) {
    if (this.run.endless && this.run._endlessConfig) {
      this.planetConfig = this.run._endlessConfig;
      if (!this.sectorInfo) this.sectorInfo = getSectorInfo('sector1');
    } else {
      const planets = getPlanetsForSector(this.run.sector);
      this.planetConfig = planets[index];
      this.sectorInfo = getSectorInfo(this.run.sector);
    }
    this.biome = this.sectorInfo ? this.sectorInfo.biome : 'space';
    this.map = generatePlanet(this.planetConfig, this.biome);
    this.camera.setWorldSize(this.map.width, this.map.height);
    this.player.spawn(this.map.spawnX, this.map.spawnY, this.run);
    placeEntitySafely(this.player, this.map, this.map.spawnX, this.map.spawnY);
    this.player.hp = this.run.hp;
    this.player.maxHp = this.run.maxHp;
    this.player.grounded = isOnGround(this.player, this.map);
    this.camera.snapTo(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);
    this.enemies = setupPlanetEnemies(this.planetConfig, this.map, this.run);
    this.pickups = (this.map.pickups || []).map(p => new Pickup(p.x, p.y, p.type));
    this.crates = (this.map.crates || []).map(c => new Crate(c.x, c.y));
    this._clearPool();
    this.boss = null;
    this.waveManager.reset(this.planetConfig.waves || [], (e) => this.enemies.push(e));
    this.mining.reset();
    const planetTimeBonus = this.planetConfig.timeBonus || 0;
    const timerPenalty = this.run.timerPenalty || 1;
    this.planetTimer.start((PLANET_TIMER + this.run.timerBonus + planetTimeBonus) * timerPenalty);
    this.run.sessionOre = { iron: 0, crystal: 0 };
    this.state = STATE.PLANET;
    this.hud.show();
    this.particles = [];
    this._impacts = [];
    this.snowParticles = this.biome === 'ice' ? spawnSnow(this.canvas.width, this.canvas.height) : [];
    if (this.biome === 'lava') {
      this.snowParticles = spawnEmbers(this.canvas.width, this.canvas.height);
    }
    audio.setBiome(this.biome);
    if (this.run && this.run.sector === 'sector1') {
      const img = new Image();
      img.onload = () => { this.bgImage._images['space'] = img; this.bgImage._loaded['space'] = true; };
      img.src = 'assets/backgrounds/bg_sector1.jpg';
    } else {
      this.bgImage.load(this.biome);
    }
    this.events = generateEvents(this.planetConfig, this.map);
    for (const ev of this.events) {
      const enemy = initEventEnemy(ev);
      if (enemy) this.enemies.push(enemy);
    }
  }

  loadBoss() {
    const isIce = this.biome === 'ice';
    const isLava = this.biome === 'lava';
    this.planetConfig = isIce ? ICE_BOSS_PLANET : isLava ? LAVA_BOSS_PLANET : BOSS_PLANET;
    this.map = generateBossArena(this.biome);
    this.camera.setWorldSize(this.map.width, this.map.height);
    this.player.spawn(this.map.spawnX, this.map.spawnY, this.run);
    placeEntitySafely(this.player, this.map, this.map.spawnX, this.map.spawnY);
    this.player.hp = this.run.hp;
    this.player.maxHp = this.run.maxHp;
    this.player.grounded = isOnGround(this.player, this.map);
    this.camera.snapTo(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);
    this.enemies = [];
    this._clearPool();
    if (isIce) this.boss = createIceBoss(this.map);
    else this.boss = isLava ? createLavaBoss(this.map) : createBoss(this.map);
    this.mining.reset();
    this.planetTimer.stop();
    this.run.sessionOre = { iron: 0, crystal: 0 };
    this.state = STATE.BOSS;
    this.hud.show();
    this.particles = [];
    this.pickups = [];
    this.crates = [];
    this.events = [];
    this.snowParticles = [];
    audio.playBossMusic();
  }

  finishPlanet() {
    this.run.oreBank.iron += this.run.sessionOre.iron;
    this.run.oreBank.crystal += this.run.sessionOre.crystal;

    const etherMult = this.run.etherMult || 1;
    const etherReward = Math.round((this.run.etherPerPlanet || 5) * etherMult);
    SaveManager.awardEtherSerum(this.meta, etherReward);
    SaveManager.recordRunEnd(this.meta, 'evacuate', this.run.sessionOre.iron + this.run.sessionOre.crystal);

    this.run.sessionOre = { iron: 0, crystal: 0 };
    this.run.hp = this.player.hp;

    this.fadeTransition(() => {
      if (this.run.endless) {
        this.run.planetIndex++;
        const biomes = ['space', 'ice', 'lava'];
        const b = biomes[this.run.planetIndex % biomes.length];
        this.run._endlessBiomeOffset = (this.run._endlessBiomeOffset || 0) + 1;
        const planetsList = getPlanetsForSector('sector1');
        const idx = this.run.planetIndex % planetsList.length;
        const baseConfig = planetsList[idx];
        const difficultyMult = 1 + Math.floor(this.run.planetIndex / planetsList.length) * 0.5;
        this.run._endlessConfig = {
          ...baseConfig,
          timeBonus: Math.max(-15, -(Math.floor(this.run.planetIndex / 2) * 5)),
          enemies: baseConfig.enemies.map(e => ({ ...e, count: Math.ceil(e.count * difficultyMult) })),
          waves: (baseConfig.waves || []).map(w => ({
            delay: Math.max(8, w.delay - Math.floor(this.run.planetIndex / 2) * 3),
            enemies: w.enemies.map(e => ({ ...e, count: Math.ceil(e.count * difficultyMult) })),
          })),
        };
        const endlessSector = getSectorInfo(b === 'space' ? 'sector1' : b === 'ice' ? 'sector2' : 'sector3');
        this.biome = endlessSector.biome;
        this.sectorInfo = endlessSector;
        this.run.phase = 'planets';
      } else {
        const planets = getPlanetsForSector(this.run.sector);
        this.run.planetIndex++;
        if (this.run.planetIndex >= planets.length) {
          this.run.phase = 'boss';
        }
      }
      this.state = STATE.SHOP;
      this.hud.hide();
      this.shopUI.show(this.run);
      audio.sfxEvacuate();
    });
  }

  afterShop() {
    this.fadeTransition(() => {
      if (this.run.phase === 'boss') {
        const bossName = this.biome === 'ice' ? ICE_BOSS_PLANET.name : this.biome === 'lava' ? LAVA_BOSS_PLANET.name : BOSS_PLANET.name;
        this.hubMessage = 'Финальная миссия: ' + bossName;
        this.state = STATE.HUB;
        this.menuUI.showHub(this.run, this.hubMessage, this.sectorInfo.name, this.sectorInfo.biome, 'black_hole');
      } else {
        const planets = getPlanetsForSector(this.run.sector);
        this.hubMessage = 'Следующая высадка: ' + planets[this.run.planetIndex].name;
        this.state = STATE.HUB;
        this.menuUI.showHub(this.run, this.hubMessage, this.sectorInfo.name, this.sectorInfo.biome);
      }
    });
  }

  onDeath() {
    this.state = STATE.GAME_OVER;
    this.hud.hide();
    this.fadeTransition(() => {
      const stats = {
        oreIron: this.run.oreBank.iron + this.run.sessionOre.iron,
        oreCrystal: this.run.oreBank.crystal + this.run.sessionOre.crystal,
        kills: this.run.kills || 0,
        time: this.planetTimer ? this.planetTimer.format() : '00:00',
        sector: this.sectorInfo ? this.sectorInfo.name : '—',
      };
      this.menuUI.showGameOver(stats);
      SaveManager.recordRunEnd(this.meta, 'lose', 0);
      audio.sfxLose();
      audio.stopMusic();
    });
  }

  onWin() {
    this.state = STATE.WIN;
    this.hud.hide();
    this.fadeTransition(() => {
      const etherReward = 50;
      const sector = this.run ? this.run.sector : 'sector1';
      let newUnlock = '';
      if (sector === 'sector1' && !this.meta.stats.sector2Unlocked) {
        this.meta.stats.sector2Unlocked = true;
        newUnlock = 'sector2';
      }
      if (sector === 'sector2' && !this.meta.stats.sector3Unlocked) {
        this.meta.stats.sector3Unlocked = true;
        newUnlock = 'sector3';
      }
      if (sector === 'sector3' && !this.meta.stats.endlessUnlocked) {
        this.meta.stats.endlessUnlocked = true;
        newUnlock = 'endless';
      }
      SaveManager.awardEtherSerum(this.meta, etherReward);
      SaveManager.recordRunEnd(this.meta, 'win', this.run.oreBank.iron + this.run.oreBank.crystal);
      const sector2Unlocked = this.meta.stats.sector2Unlocked;
      const sector3Unlocked = this.meta.stats.sector3Unlocked;
      const endlessUnlocked = this.meta.stats.endlessUnlocked;
      this.menuUI.showWin(sector, sector2Unlocked, sector3Unlocked, endlessUnlocked, newUnlock);
      audio.sfxWin();
      audio.startMusic(this.biome);
    });
  }

  startSector(sectorId) {
    const endless = sectorId === 'endless';
    this.run = createRunState();
    SaveManager.applyMetaUpgrades(this.run, this.meta);
    this.player.reset();
    this.run.hp = this.run.maxHp;
    this.run.sector = sectorId;
    this.sectorInfo = getSectorInfo(endless ? 'sector1' : sectorId);
    this.biome = this.sectorInfo.biome;
    this.run.planetIndex = 0;
    this.run.phase = 'planets';
    this.run.endless = endless;
    this.state = STATE.HUB;
    this.hubMessage = endless ? 'Режим: Бесконечность — первая высадка'
      : 'Первая высадка: ' + this.sectorInfo.planets[0].name;
    this.menuUI.showHub(this.run, this.hubMessage,
      endless ? '∞ Бесконечность' : this.sectorInfo.name,
      endless ? 'space' : this.sectorInfo.biome);
    this.hud.hide();
    this.particles = [];
    this.pickups = [];
    this.snowParticles = [];
    this.events = [];
    audio.setBiome(this.biome);
    this.bgImage.load(this.biome);
    audio.startMusic(this.biome);
  }

  _resume() {
    this.state = this._pausedPrevState || STATE.PLANET;
    this.pauseUI.hide();
  }

  _quitToMenu() {
    this.pauseUI.hide();
    this.state = STATE.MENU;
    this.menuUI.showMenu();
    this.hud.hide();
    audio.stopMusic();
  }

  _handleEscape() {
    const metaOverlay = document.getElementById('meta-shop-overlay');
    if (metaOverlay && !metaOverlay.classList.contains('hidden')) {
      this.metaShopUI.hide();
      return;
    }
    if (this.state === STATE.PLANET || this.state === STATE.BOSS) {
      this._pausedPrevState = this.state;
      this.state = STATE.PAUSED;
      this.pauseUI.show();
    } else if (this.state === STATE.PAUSED) {
      this._resume();
    } else if (this.state === STATE.SHOP) {
      this.shopUI.hide();
      this.afterShop();
    } else if (this.state === STATE.GAME_OVER) {
      this.startRun();
    } else if (this.state === STATE.WIN) {
      this.startRun();
    }
  }

  update(dt) {
    this.updateFade(dt);
    if (this.state !== STATE.PAUSED) {
      this.time += dt;
    }

    if (this.input.mapPressed() && !this._prevMapPressed) {
      this._mapVisible = !this._mapVisible;
    }
    this._prevMapPressed = this.input.mapPressed();

    if (this.input.escapePressed()) {
      this._handleEscape();
    }

    if (this.state === STATE.PLANET || this.state === STATE.BOSS) {
      this.updateGameplay(dt);
    }

    this.input.endFrame();
  }

  updateGameplay(dt) {
    this._playerWasGrounded = this.player.grounded;
    this.player.update(this.input, this.map, dt, this.run, this.biome);
    if (this.player.justHurt) {
      this.player.justHurt = false;
      this.camera.shake(4, 0.15);
    }
    if (!this._playerWasGrounded && this.player.grounded && this.player.vy > 100) {
      spawnLandingParticles(this.player.x + this.player.w / 2, this.player.y + this.player.h, this.particles);
    }

    if (this.input.ultimatePressed() && this.player.useUltimate()) {
      spawnDeathParticles(this.player.x + this.player.w / 2, this.player.y, 24, 24, '#ff8800', this.particles);
      audio.sfxUltimate();
    }

    if (this.input.fireHeld()) {
      const muzzle = this.player.tryFire((cx, cy, dirX, speed, owner) => {
        const count = this.run.multiShot || 1;
        const spread = 0.06;
        const homing = this.run.homing || 0;
        for (let i = 0; i < count; i++) {
          const angle = (i - (count - 1) / 2) * spread;
          this.spawnProjectile(cx, cy, dirX, speed, owner, angle * speed, homing);
        }
      }, this.camera);
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

      if (this.planetTimer.remaining <= 30) {
        this.heartbeatTimer -= dt;
        const interval = this.planetTimer.remaining <= 10 ? 0.5 : this.planetTimer.remaining <= 20 ? 1 : 2;
        if (this.heartbeatTimer <= 0) {
          this.heartbeatTimer = interval;
          audio.sfxHeartbeat();
        }
      }

      this.waveManager.update(this.planetTimer.elapsed, this.map.width, this.map.height);

      this.player.miningActive = this.input.action() && this.mining.findNearbyOres(this.player, this.map, 1).length > 0;
      const mined = this.mining.update(this.input, this.player, this.map, this.run, dt);
      if (mined) {
        const oreMult = this.run.orePenalty ? (1 - this.run.orePenalty) : 1 + (this.run.oreBonus || 0);
        this.run.sessionOre[mined.type] += Math.round(mined.amount * oreMult);
        this.planetTimer.addTime(1);
        this.player.addUltimateCharge(5);
        const px = this.player.x + this.player.w / 2;
        const py = this.player.y + this.player.h / 2;
        spawnMineParticles(px, py, mined.type === 'iron' ? '#c87020' : '#40c8e8', this.particles);
      }

      let eventInteracted = false;
      for (const ev of this.events) {
        if (!ev.active || ev.dead) continue;
        const msg = ev.interact(this.player, this.run, this.meta);
        if (typeof msg === 'string') {
          this.floatingTexts.push(new FloatingText(this.player.x + this.player.w / 2, this.player.y - 10, msg, '#ffe066', 1.5));
          eventInteracted = true;
          break;
        } else if (msg !== null) {
          eventInteracted = true;
          break;
        }
      }

      if (!eventInteracted && this.input.action() && checkEvacuation(this.player, this.map)) {
        const oreNear = this.mining.findNearbyOres(this.player, this.map, 1);
        if (oreNear.length === 0) {
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
        this.floatingTexts.push(new FloatingText(this.player.x + this.player.w / 2, this.player.y - 10, '-' + hazardDmg, '#ff6644', 1.2));
        audio.sfxHurt();
      }
    }

    for (const ev of this.events) {
      if (!ev.active || ev.dead) continue;
      const result = ev.update(dt, this.player, this.map, this.run, this.meta);
      if (result === 'death') { this.onDeath(); return; }
    }
    this.events = this.events.filter(ev => !ev.dead);

    for (const e of this.enemies) {
      e.update(dt, this.map, this.player, (...args) => this.spawnProjectile(...args));
    }

    for (const buf of this.enemies) {
      if (buf.type === 'buffer' && !buf.dead) {
        buf._buffCooldown -= dt;
        if (buf._buffCooldown <= 0.5 && buf._buffCooldown >= 0 && buf._lastBuffTime !== buf._buffCooldown) {
          buf._lastBuffTime = buf._buffCooldown;
          for (const e2 of this.enemies) {
            if (e2 === buf || e2.dead) continue;
            const dx = e2.x - buf.x;
            const dy = e2.y - buf.y;
            if (Math.sqrt(dx * dx + dy * dy) < 200) {
              e2._buffed = true;
              e2._buffTimer = 0.5;
            }
          }
        }
        if (buf._buffCooldown <= 0) { buf._buffCooldown = 3; buf._lastBuffTime = 3; }
      }
    }
    for (const e3 of this.enemies) {
      if (e3._buffed && e3._buffTimer !== undefined) {
        e3._buffTimer -= dt;
        if (e3._buffTimer <= 0) { e3._buffed = false; e3._buffTimer = 0; }
      }
    }
    for (const p of this.pickups) {
      p.update(dt);
      if (!p.dead && aabbOverlap(this.player, p)) {
        p.dead = true;
        audio.sfxPickup();
        if (p.type === 'health') {
          this.player.hp = Math.min(this.player.hp + 25, this.player.maxHp);
          spawnDeathParticles(p.x, p.y, p.w, p.h, '#44dd66', this.particles);
        } else if (p.type === 'shield') {
          this.player.shield = 5;
          spawnDeathParticles(p.x, p.y, p.w, p.h, '#4488ff', this.particles);
        } else if (p.type === 'speed') {
          this.player.speedBoost = 3;
          spawnDeathParticles(p.x, p.y, p.w, p.h, '#ffcc00', this.particles);
        } else if (p.type === 'oreDrop') {
          this.run.sessionOre.iron += 1;
          this.run.sessionOre.crystal += 1;
          spawnDeathParticles(p.x, p.y, p.w, p.h, '#ddaa44', this.particles);
        }
      }
    }
    if (this.boss) {
      this.boss.update(dt, this.map, this.player, (...args) => this.spawnProjectile(...args), this.enemies);
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

    updateProjectiles(this.projectiles, this.map, dt, this._projectilePool, this.enemies);

    this.pickups = this.pickups.filter((p) => !p.dead);
    this.particles = this.particles.filter((p) => !p.dead);
    for (const p of this.particles) p.update(dt);
    for (const t of this.floatingTexts) t.update(dt);
    this.floatingTexts = this.floatingTexts.filter(t => !t.dead);
    for (const imp of this._impacts) imp.life -= dt;
    this._impacts = this._impacts.filter(imp => imp.life > 0);

    for (const s of this.snowParticles) s.update(dt, this.canvas.width, this.canvas.height);

    const result = this.combat.update(this.player, this.enemies, this.boss, this.projectiles, this.run, dt, this.crates, this.floatingTexts);
    if (this.combat.screenShake > 0) this.camera.shake(3, this.combat.screenShake);
    if (result === 'death') {
      this.run.hp = 0;
      this.onDeath();
      return;
    }
    for (const p of this.projectiles) {
      if (p.dead) {
        this._impacts.push({ x: p.x + p.w / 2, y: p.y + p.h / 2, life: 0.25 });
      }
    }

    for (const e of this.enemies) {
      if (e.dead) {
        spawnDeathParticles(e.x, e.y, e.w, e.h, e.elite ? '#ffd700' : (e.type === 'crawler' ? '#e04040' : '#a040e0'), this.particles);
        this.run.kills = (this.run.kills || 0) + 1;
        this.player.addUltimateCharge(8);
        if (this.run.vampirism) {
          this.player.hp = Math.min(this.player.hp + Math.round(15 * this.run.vampirism), this.player.maxHp);
        }
        if (e.elite || Math.random() < 0.4) {
          const oreType = Math.random() < 0.6 ? 'iron' : 'crystal';
          this.run.sessionOre[oreType] += 1;
        }
        if (e.etherDrop > 0) {
          SaveManager.awardEtherSerum(this.meta, e.etherDrop);
        }
        if (Math.random() < 0.2) {
          const types = ['shield', 'speed', 'oreDrop'];
          this.pickups.push(new Pickup(e.x, e.y + e.h / 2, types[Math.floor(Math.random() * 3)]));
        }
      }
    }

    for (const c of this.crates) {
      if (c.dead) {
        audio.sfxCrateBreak();
        const types = ['health', 'oreDrop', 'shield', 'speed'];
        this.pickups.push(new Pickup(c.x, c.y, types[Math.floor(Math.random() * 4)]));
      }
    }
    this.crates = this.crates.filter((c) => !c.dead);
    this.enemies = this.enemies.filter((e) => !e.dead);
    this.run.hp = this.player.hp;
    this.camera.follow(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, dt);

    this.hud.update(
      this.player,
      this.run,
      this.planetTimer,
      this.mining.getProgress(),
      this.state === STATE.PLANET,
      this.state === STATE.PLANET ? this.waveManager : null,
      dt
    );
  }

  render(dt) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const bgKey = this.biome;

    const bc = getBiome(this.biome);
    if (this.bgImage && this.bgImage.isReady(bgKey)) {
      this.bgImage.render(ctx, bgKey, this.camera, w, h);
    }
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, bc.sky1);
    grad.addColorStop(1, bc.sky2);
    ctx.fillStyle = grad;
    ctx.globalAlpha = this.biome === 'ice' ? 0.2 : (this.bgImage && this.bgImage.isReady(bgKey) ? 0.5 : 1);
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    if (this.state !== STATE.PLANET && this.state !== STATE.BOSS && this.state !== STATE.PAUSED) return;

    this.renderBackground(ctx, bc);
    this.camera.apply(ctx, dt);
    this.map.render(ctx, this.camera, this.time);
    this.map.renderIceSprites(ctx, this.camera);
    this.map.renderMarkers(ctx, this.time);
    if (fxSheets.isReady()) {
      const ex = this.map.exitX;
      const ey = this.map.exitY;
      const portalH = (TUNNEL.CAVE_BOTTOM - TUNNEL.CAVE_TOP + 2) * TILE_SIZE;
      const total = fxSheets.get('magicSpell')?.totalFrames ?? 1;
      const frame = Math.floor(this.time * 8) % total;
      const scale = portalH / 100;
      const sw = Math.round(100 * scale);
      const sh = Math.round(100 * scale);
      fxSheets.drawFrame(ctx, 'magicSpell', frame, ex - sw / 2, ey - sh, sw, sh);
    }
    this.map.renderMiningTargets(ctx, this.mining.targets, this.time);

    for (const e of this.enemies) e.render(ctx);
    for (const p of this.pickups) p.render(ctx);
    for (const c of this.crates) c.render(ctx);
    for (const ev of this.events) {
      if (ev.active && !ev.dead) ev.render(ctx);
    }
    if (this.boss) this.boss.render(ctx, this.time);
    this.player.render(ctx, this.time);
    for (const p of this.projectiles) renderProjectile(ctx, p);
    for (const p of this.particles) p.render(ctx);
    for (const imp of this._impacts) {
      const total = fxSheets.get('weaponHit')?.totalFrames;
      if (total == null) continue;
      const idx = Math.floor((1 - imp.life / 0.25) * total);
      const size = 24;
      fxSheets.drawFrame(ctx, 'weaponHit', idx, imp.x - size / 2, imp.y - size / 2, size, size);
    }
    for (const t of this.floatingTexts) t.render(ctx);

    this.camera.restore(ctx);

    const darkMult = this.run ? (this.run.darknessMult || 1) : 1;
    this.lighting.clear();
    this.lighting.add(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 180 * darkMult, [255, 220, 150], 0.6 * darkMult);
    if (this.map) {
      const cx = Math.floor((this.camera.x + this.canvas.width / 2) / 32);
      const cy = Math.floor((this.camera.y + this.canvas.height / 2) / 32);
      const viewTx = Math.ceil(this.canvas.width / 64);
      const viewTy = Math.ceil(this.canvas.height / 64);
      for (let tx = cx - viewTx; tx <= cx + viewTx; tx++) {
        for (let ty = cy - viewTy; ty <= cy + viewTy; ty++) {
          const tile = this.map.get(tx, ty);
          if (tile === TILE.ORE_IRON || tile === TILE.ORE_CRYSTAL) {
            this.lighting.add(tx * 32 + 16, ty * 32 + 16, 40, tile === TILE.ORE_CRYSTAL ? [100, 200, 255] : [255, 160, 80], 0.3);
          } else if (tile === TILE.EXIT_PAD) {
            this.lighting.add(this.map.exitX, this.map.exitY, 100, [80, 255, 160], 0.4);
          }
        }
      }
    }
    if (this.biome === 'ice') {
      for (let i = 0; i < 6; i++) {
        const lx = Math.random() * this.canvas.width;
        const ly = this.camera.y + Math.random() * this.canvas.height;
        this.lighting.add(lx, ly, 50, [120, 220, 255], 0.15);
      }
    }
    if (this.biome === 'lava') {
      for (let i = 0; i < 4; i++) {
        const lx = Math.random() * this.canvas.width;
        const ly = this.camera.y + Math.random() * this.canvas.height;
        this.lighting.add(lx, ly, 60, [255, 100, 30], 0.15);
      }
    }
    this.lighting.render(ctx, null);

    for (const s of this.snowParticles) s.render(ctx);

    this._drawExitBeacon(ctx);

    if (this.map && (this.state === STATE.PLANET || this.state === STATE.BOSS)) {
      this.map.renderMinimap(ctx, this.canvas.width - 130, 8, 120, 80, this.player.x, this.player.y);
    }

    if (this.state === STATE.PLANET && this.planetTimer.remaining <= 30) {
      const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.7);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(180,0,0,${0.15 + 0.1 * Math.sin(this.time * 4)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    if (this.state === STATE.BOSS) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      const bossName = this.biome === 'lava' ? 'Lava Titan' : 'Mould Titan';
      ctx.fillText('Победите ' + bossName + '!', this.canvas.width / 2, 30);
    } else if (this.planetConfig) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(this.planetConfig.name, 16, 24);
    }

    if (this._mapVisible && this.map && (this.state === STATE.PLANET || this.state === STATE.BOSS || this.state === STATE.PAUSED)) {
      this.map.renderFullMap(ctx, this.canvas.width, this.canvas.height, this.player.x, this.player.y, this.enemies, this.pickups);
    }

    if (this._fadeAlpha > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this._fadeAlpha})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  _drawExitBeacon(ctx) {
    if (!this.map || this.state !== STATE.PLANET) return;
    const ex = this.map.exitX;
    const ey = this.map.exitY;
    const cx = this.camera.x + this.canvas.width / 2;
    const cy = this.camera.y + this.canvas.height / 2;
    const dx = ex - cx;
    const dy = ey - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 200) return;
    const angle = Math.atan2(dy, dx);
    const pad = 60;
    const hw = this.canvas.width / 2 - pad;
    const hh = this.canvas.height / 2 - pad;
    const t = Math.min(hw / Math.abs(Math.cos(angle) || 0.001), hh / Math.abs(Math.sin(angle) || 0.001));
    const bx = this.canvas.width / 2 + Math.cos(angle) * t;
    const by = this.canvas.height / 2 + Math.sin(angle) * t;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(angle);
    const pulse = 0.7 + Math.sin(this.time * 3) * 0.3;
    ctx.fillStyle = `rgba(80, 255, 140, ${pulse})`;
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-6, -8);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(80, 255, 140, ${0.5 + pulse * 0.3})`;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ВЫХОД', 0, -16);
    ctx.restore();
  }

  renderBackground(ctx, bc) {
    const parallax1 = this.camera.x * 0.2;
    const parallax2 = this.camera.x * 0.4;
    const isIce = this.biome === 'ice';

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

    if (isIce) {
      for (let i = 0; i < 5; i++) {
        const px = (-parallax1 * (0.5 + i * 0.2) % 400 - 100 + i * 90 + 50) % this.canvas.width;
        const py = 40 + (i * 30 + Math.sin(this.time + i) * 10) % 140;
        ctx.fillStyle = `rgba(200, 240, 255, ${0.08 + Math.sin(this.time * 0.5 + i) * 0.04})`;
        ctx.beginPath();
        ctx.moveTo(px, py - 10);
        ctx.lineTo(px - 4, py + 6);
        ctx.lineTo(px + 4, py + 6);
        ctx.closePath();
        ctx.fill();
      }

      const w = this.canvas.width;
      const h = this.canvas.height;
      for (let side = 0; side < 2; side++) {
        const baseX = side === 0 ? -parallax1 * 0.3 % 100 - 40 : w + parallax1 * 0.3 % 100 - 60;
        const fallGrad = ctx.createLinearGradient(baseX, 0, baseX + 50, 0);
        fallGrad.addColorStop(0, 'rgba(160, 230, 255, 0)');
        fallGrad.addColorStop(0.3, `rgba(180, 240, 255, ${0.08 + 0.05 * Math.sin(this.time * 0.5)})`);
        fallGrad.addColorStop(0.7, `rgba(160, 230, 255, ${0.06 + 0.04 * Math.sin(this.time * 0.3 + 1)})`);
        fallGrad.addColorStop(1, 'rgba(160, 230, 255, 0)');
        ctx.fillStyle = fallGrad;
        ctx.fillRect(baseX, 20, 50, h * 0.7);
        for (let j = 0; j < 6; j++) {
          const stripY = 30 + j * (h * 0.7 / 6);
          ctx.fillStyle = `rgba(200, 245, 255, ${0.06 + 0.04 * Math.sin(this.time * 0.7 + j)})`;
          ctx.fillRect(baseX + 8 + Math.sin(this.time + j) * 5, stripY, 34, 8);
          ctx.fillRect(baseX + 14 + Math.cos(this.time * 0.5 + j) * 4, stripY + 12, 22, 6);
        }
      }

      if (iceTiles.isReady('entities')) {
        const hw = this.canvas.width / 2;
        const hh = this.canvas.height / 2;
        iceTiles.drawDecor(ctx, 8, -parallax1 * 0.15 % 300 - 40, hh * 0.7, 32, 32);
        iceTiles.drawDecor(ctx, 9, w - 140 + parallax1 * 0.15 % 300, hh * 0.75, 32, 32);
      }
    }

    if (this.biome === 'lava') {
      const w = this.canvas.width;
      const h = this.canvas.height;
      for (let i = 0; i < 4; i++) {
        const px = (-parallax1 * (0.3 + i * 0.25) % 300 + i * 80) % w;
        const py = 60 + (i * 40 + Math.sin(this.time * 0.3 + i * 2) * 15) % (h * 0.4);
        ctx.fillStyle = `rgba(255, 120, 40, ${0.06 + 0.04 * Math.sin(this.time * 0.4 + i)})`;
        ctx.beginPath();
        ctx.arc(px, py, 6 + Math.sin(this.time + i) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let side = 0; side < 2; side++) {
        const baseX = side === 0 ? -parallax1 * 0.2 % 120 - 30 : w + parallax1 * 0.2 % 120 - 30;
        const grad = ctx.createLinearGradient(baseX, 0, baseX + 30, 0);
        grad.addColorStop(0, 'rgba(255, 80, 20, 0)');
        grad.addColorStop(0.5, `rgba(255, 120, 40, ${0.05 + 0.04 * Math.sin(this.time * 0.6)})`);
        grad.addColorStop(1, 'rgba(255, 80, 20, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(baseX, 30, 30, h * 0.6);
      }
    }
  }
}
