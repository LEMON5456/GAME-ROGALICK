import { TILE, TILE_SIZE, TUNNEL } from '../constants.js';
import { audio } from '../core/Audio.js';
import { SaveManager } from '../core/SaveManager.js';

const EVENT_CHANCE = 0.4;

function rand(min, max) { return min + Math.random() * (max - min); }

function spendOre(run, type, amount) {
  let left = amount;
  const session = type === 'iron' ? run.sessionOre.iron : run.sessionOre.crystal;
  const bank = type === 'iron' ? run.oreBank.iron : run.oreBank.crystal;
  const sKey = type === 'iron' ? 'iron' : 'crystal';
  const bKey = type === 'iron' ? 'iron' : 'crystal';
  if (session >= left) { run.sessionOre[sKey] -= left; return; }
  run.sessionOre[sKey] = 0;
  left -= session;
  run.oreBank[bKey] -= left;
}

function totalOre(run, type) {
  return (type === 'iron' ? run.sessionOre.iron + run.oreBank.iron : run.sessionOre.crystal + run.oreBank.crystal);
}

export function generateEvents(planetConfig, map) {
  const events = [];
  if (planetConfig.events === false) return events;
  const forced = planetConfig.events;

  if ((forced && forced.includes('quest_chest')) || (!forced && Math.random() < EVENT_CHANCE)) {
    const e = questChest(map);
    if (e) events.push(e);
  }
  if ((forced && forced.includes('trader')) || (!forced && Math.random() < EVENT_CHANCE * 0.8)) {
    const e = trader(map);
    if (e) events.push(e);
  }
  if ((forced && forced.includes('radiation_zone')) || (!forced && Math.random() < EVENT_CHANCE * 0.6)) {
    const e = radiationZone(map);
    if (e) events.push(e);
  }
  if ((forced && forced.includes('mini_boss')) || (!forced && Math.random() < EVENT_CHANCE * 0.4)) {
    const e = miniBossEvent(map);
    if (e) events.push(e);
  }
  return events;
}

function findSpot(map, attempts = 20) {
  for (let i = 0; i < attempts; i++) {
    const tx = Math.floor(rand(8, map.width - 8));
    const ty = TUNNEL.CAVE_BOTTOM;
    if (map.get(tx, ty) === TILE.AIR && map.get(tx, ty + 1) === TILE.STONE) {
      return { x: tx * TILE_SIZE, y: ty * TILE_SIZE, tx, ty };
    }
  }
  const tx = Math.floor(map.width / 2);
  const ty = TUNNEL.CAVE_BOTTOM;
  return { x: tx * TILE_SIZE, y: ty * TILE_SIZE, tx, ty };
}

export function initEventEnemy(event) {
  if (event.type !== 'mini_boss' || event._spawned) return null;
  event._spawned = true;
  const enemy = {
    type: 'crawler',
    x: event.x, y: event.y, w: 32, h: 24,
    hp: 200, maxHp: 200, damage: 14, vx: 0, vy: 0,
    grounded: false, moveDir: -1, dead: false, elite: true,
    contact: true,
    etherDrop: 5,
    takeDamage(amount) { this.hp -= amount; if (this.hp <= 0) { this.hp = 0; this.dead = true; } },
    update(dt, map, player) {
      const dx = player.x + player.w / 2 - (this.x + this.w / 2);
      this.moveDir = dx < 0 ? -1 : 1;
      this.vx = this.moveDir * 60;
      this.vy = Math.min(this.vy + 600 * dt, 600);
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.grounded = false;
      const tx = Math.floor((this.x + this.w / 2) / 32);
      const ty = Math.floor((this.y + this.h) / 32);
      if (map.get(tx, ty) === TILE.STONE) {
        this.y = ty * 32 - this.h;
        this.vy = 0;
        this.grounded = true;
      }
    },
    render(ctx) {
      if (this.dead) return;
      ctx.fillStyle = '#cc44ff';
      ctx.shadowColor = '#aa22ff';
      ctx.shadowBlur = 14;
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.shadowBlur = 0;
      const barW = 40;
      ctx.fillStyle = '#333';
      ctx.fillRect(this.x + this.w / 2 - barW / 2, this.y - 12, barW, 4);
      ctx.fillStyle = '#ff44ff';
      ctx.fillRect(this.x + this.w / 2 - barW / 2, this.y - 12, barW * (this.hp / this.maxHp), 4);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MINI BOSS', this.x + this.w / 2, this.y - 16);
    },
  };
  event._enemy = enemy;
  return enemy;
}

function questChest(map) {
  const spot = findSpot(map);
  if (!spot) return null;
  return {
    type: 'quest_chest', x: spot.x, y: spot.y, w: 32, h: 32,
    active: true, dead: false, opened: false,
    quest: { iron: 5 },
    update(dt) { if (this.active && !this.opened) this._t = (this._t || 0) + dt; },
    render(ctx, cam, time) {
      if (!this.active || this.opened) return;
      const s = 1 + Math.sin(time * 2) * 0.08;
      ctx.save();
      ctx.translate(this.x + 16, this.y + 16);
      ctx.scale(s, s);
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 12;
      ctx.fillRect(-12, -10, 24, 20);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#b8860b';
      ctx.fillRect(-8, -4, 16, 12);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', 0, 4);
      ctx.restore();
      ctx.fillStyle = 'rgba(255,215,0,0.6)';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`[E] Fe:${this.quest.iron}`, this.x + 16, this.y + 40);
    },
    interact(player, run, meta) {
      if (Math.hypot(player.x + player.w / 2 - this.x, player.y + player.h / 2 - this.y) > 40) return null;
      if (totalOre(run, 'iron') >= this.quest.iron) {
        spendOre(run, 'iron', this.quest.iron);
        this.opened = true;
        this.active = false;
        SaveManager.awardEtherSerum(meta, 3);
        audio.sfxBuy();
        return '+3 Ether Serum!';
      }
      return 'Не хватает железа';
    },
  };
}

function trader(map) {
  const spot = findSpot(map);
  if (!spot) return null;
  const offers = [
    { cost: { iron: 4 }, reward: { hp: 30 }, label: 'Аптечка (Fe:4)' },
    { cost: { crystal: 3 }, reward: { shield: 5 }, label: 'Щит (Cr:3)' },
    { cost: { iron: 3, crystal: 3 }, reward: { ether: 2 }, label: 'Эфир (Fe:3+Cr:3)' },
  ];
  return {
    type: 'trader', x: spot.x, y: spot.y, w: 36, h: 48,
    active: true, dead: false, offers,
    update(dt) { this._t = (this._t || 0) + dt; },
    render(ctx) {
      ctx.fillStyle = '#44aadd';
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 10;
      ctx.fillRect(this.x, this.y, 36, 48);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$', this.x + 18, this.y + 28);
      ctx.fillStyle = 'rgba(68,170,221,0.5)';
      ctx.font = '8px sans-serif';
      ctx.fillText('ТОРГОВЕЦ', this.x + 18, this.y + 60);
    },
    interact(player, run, meta) {
      if (Math.hypot(player.x + player.w / 2 - this.x, player.y + player.h / 2 - this.y) > 50) return null;
      for (const o of this.offers) {
        const canIron = !o.cost.iron || totalOre(run, 'iron') >= o.cost.iron;
        const canCrystal = !o.cost.crystal || totalOre(run, 'crystal') >= o.cost.crystal;
        if (canIron && canCrystal) {
          if (o.cost.iron) spendOre(run, 'iron', o.cost.iron);
          if (o.cost.crystal) spendOre(run, 'crystal', o.cost.crystal);
          if (o.reward.hp) player.hp = Math.min(player.hp + o.reward.hp, player.maxHp);
          if (o.reward.shield) player.shield = o.reward.shield;
          if (o.reward.ether) SaveManager.awardEtherSerum(meta, o.reward.ether);
          audio.sfxBuy();
          return o.label;
        }
      }
      return 'Не хватает ресурсов';
    },
  };
}

function radiationZone(map) {
  const spot = findSpot(map, 15);
  if (!spot) return null;
  const zoneW = Math.floor(rand(4, 8));
  const zoneH = Math.floor(rand(3, 5));
  const oreCount = Math.floor(rand(4, 8));
  for (let i = 0; i < oreCount; i++) {
    const ox = spot.tx + Math.floor(Math.random() * zoneW);
    const oy = spot.ty + Math.floor(Math.random() * zoneH);
    if (map.get(ox, oy) === TILE.AIR) {
      map.set(ox, oy, Math.random() < 0.5 ? TILE.ORE_IRON : TILE.ORE_CRYSTAL);
    }
  }
  return {
    type: 'radiation_zone', x: spot.x, y: spot.y, w: zoneW * 32, h: zoneH * 32,
    active: true, dead: false,
    _t: 0, _dmgTimer: 0,
    update(dt, player) {
      this._t += dt;
      const px = player.x + player.w / 2;
      const py = player.y + player.h / 2;
      if (px > this.x && px < this.x + this.w && py > this.y && py < this.y + this.h) {
        this._dmgTimer -= dt;
        if (this._dmgTimer <= 0) {
          this._dmgTimer = 0.8;
          if (player.takeDamage(8)) return 'death';
        }
      }
      return null;
    },
    render(ctx) {
      const pulse = 0.4 + Math.sin(this._t * 3) * 0.15;
      ctx.fillStyle = `rgba(100, 255, 100, ${pulse * 0.3})`;
      ctx.fillRect(this.x, this.y, this.w, this.h);
      for (let i = 0; i < 6; i++) {
        const px = this.x + Math.sin(this._t * 2 + i * 2) * this.w * 0.4 + this.w * 0.5;
        const py = this.y + Math.cos(this._t * 1.5 + i * 1.5) * this.h * 0.4 + this.h * 0.5;
        ctx.fillStyle = `rgba(80, 255, 120, ${0.3 + 0.2 * Math.sin(this._t * 4 + i)})`;
        ctx.beginPath();
        ctx.arc(px, py, 3 + Math.sin(this._t + i) * 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(100,255,100,0.6)';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('РАДИАЦИЯ', this.x + this.w / 2, this.y - 4);
    },
    interact() { return null; },
  };
}

function miniBossEvent(map) {
  const spot = findSpot(map);
  if (!spot) return null;
  return {
    type: 'mini_boss', x: spot.x, y: spot.y, w: 40, h: 40,
    active: true, dead: false,
    _spawned: false,
    update(dt) {
      this._t = (this._t || 0) + dt;
      if (this._enemy && this._enemy.dead) {
        this.dead = true;
        this.active = false;
      }
    },
    render() {},
    interact() { return null; },
  };
}
