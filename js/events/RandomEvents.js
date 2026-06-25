import { TILE, TILE_SIZE, TUNNEL, SPAWN } from '../constants.js';
import { audio } from '../core/Audio.js';
import { SaveManager } from '../core/SaveManager.js';

const EVENT_CHANCE = SPAWN.EVENT_CHANCE;

function rand(min, max) { return min + Math.random() * (max - min); }

function spendOre(run, type, amount) {
  const total = type === 'iron' ? (run.sessionOre.iron + run.oreBank.iron) : (run.sessionOre.crystal + run.oreBank.crystal);
  const spent = Math.min(amount, total);
  let left = spent;
  const session = type === 'iron' ? run.sessionOre.iron : run.sessionOre.crystal;
  const sKey = type === 'iron' ? 'iron' : 'crystal';
  const bKey = type === 'iron' ? 'iron' : 'crystal';
  if (session >= left) { run.sessionOre[sKey] -= left; return; }
  run.sessionOre[sKey] = 0;
  left -= session;
  if (left > 0) run.oreBank[bKey] -= left;
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
  if ((forced && forced.includes('spike_trap')) || (!forced && Math.random() < EVENT_CHANCE * 0.5)) {
    const e = spikeTrap(map);
    if (e) events.push(e);
  }
  if ((forced && forced.includes('treasure_room')) || (!forced && Math.random() < EVENT_CHANCE * 0.35)) {
    const e = treasureRoom(map);
    if (e) events.push(e);
  }
  if ((forced && forced.includes('time_challenge')) || (!forced && Math.random() < EVENT_CHANCE * 0.3)) {
    const e = timeChallenge(map);
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
    { cost: { iron: 4 }, reward: { hp: 30 }, label: 'Аптечка +30 HP', costStr: 'Fe:4', bought: false },
    { cost: { crystal: 3 }, reward: { shield: 5 }, label: 'Щит +5', costStr: 'Cr:3', bought: false },
    { cost: { iron: 3, crystal: 3 }, reward: { ether: 2 }, label: 'Эфир +2', costStr: 'Fe:3+Cr:3', bought: false },
  ];
  return {
    type: 'trader', x: spot.x, y: spot.y, w: 40, h: 44,
    active: true, dead: false, offers,
    _selected: 0,
    _prevAction: false,
    update(dt) { this._t = (this._t || 0) + dt; },
    render(ctx) {
      ctx.save();
      // stall body
      ctx.fillStyle = '#5c3a1e';
      ctx.shadowColor = '#3a2210';
      ctx.shadowBlur = 8;
      ctx.fillRect(this.x, this.y + 16, 40, 28);
      // counter top
      ctx.fillStyle = '#8B5E3C';
      ctx.fillRect(this.x - 2, this.y + 12, 44, 6);
      // awning
      ctx.fillStyle = '#cc4444';
      ctx.fillRect(this.x - 2, this.y, 44, 4);
      ctx.fillStyle = '#aa3333';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(this.x + i * 9 - 1, this.y + 4, 8, 8);
      }
      ctx.shadowBlur = 0;
      // items on counter
      ctx.fillStyle = '#44dd88';
      ctx.fillRect(this.x + 4, this.y + 18, 8, 8);
      ctx.fillStyle = '#4488dd';
      ctx.fillRect(this.x + 16, this.y + 20, 6, 6);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(this.x + 28, this.y + 18, 8, 8);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$', this.x + 20, this.y + 10);
      // offer list
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(this.x - 44, this.y - 28, 128, 40);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('ТОРГОВЕЦ', this.x + 20, this.y - 16);
      ctx.font = '7px sans-serif';
      let yy = this.y - 4;
      for (const o of this.offers) {
        ctx.fillStyle = o.bought ? '#666' : '#ccc';
        ctx.fillText(o.label + ' (' + o.costStr + ')' + (o.bought ? ' ✓' : ''), this.x + 20, yy);
        yy += 10;
      }
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '6px sans-serif';
      ctx.fillText('[E] купить', this.x + 20, yy + 2);
      ctx.restore();
    },
    interact(player, run, meta) {
      if (Math.hypot(player.x + player.w / 2 - this.x, player.y + player.h / 2 - this.y) > 50) return null;
      this._cooldown = (this._cooldown || 0) - 0.016;
      this._msgCooldown = (this._msgCooldown || 0) - 0.016;
      if (this._cooldown > 0) return null;
      for (const o of this.offers) {
        if (o.bought) continue;
        const canIron = !o.cost.iron || totalOre(run, 'iron') >= o.cost.iron;
        const canCrystal = !o.cost.crystal || totalOre(run, 'crystal') >= o.cost.crystal;
        if (canIron && canCrystal) {
          if (o.cost.iron) spendOre(run, 'iron', o.cost.iron);
          if (o.cost.crystal) spendOre(run, 'crystal', o.cost.crystal);
          if (o.reward.hp) player.hp = Math.min(player.hp + o.reward.hp, player.maxHp);
          if (o.reward.shield) player.shield = o.reward.shield;
          if (o.reward.ether) SaveManager.awardEtherSerum(meta, o.reward.ether);
          o.bought = true;
          this._cooldown = 1;
          audio.sfxBuy();
          return o.label + ' (' + o.costStr + ')';
        }
      }
      const anyLeft = this.offers.some(o => !o.bought);
      if (anyLeft && this._msgCooldown <= 0) { this._msgCooldown = 1; return 'Не хватает ресурсов'; }
      return null;
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

function spikeTrap(map) {
  const spot = findSpot(map);
  if (!spot) return null;
  const spikes = [];
  for (let i = 0; i < 3; i++) {
    const tx = spot.tx + 2 + Math.floor(Math.random() * 6);
    const ty = spot.ty;
    spikes.push({ tx, ty, active: true });
  }
  return {
    type: 'spike_trap', x: spot.x, y: spot.y, w: 32, h: 16,
    active: true, dead: false, spikes,
    _t: 0, _retracted: false,
    update(dt, player) {
      this._t += dt;
      for (const s of this.spikes) {
        if (!s.active) continue;
        const px = player.x + player.w / 2;
        const py = player.y + player.h / 2;
        const sx = s.tx * TILE_SIZE;
        const sy = s.ty * TILE_SIZE;
        if (px > sx && px < sx + TILE_SIZE && py > sy && py < sy + TILE_SIZE) {
          if (player.takeDamage(10)) return 'death';
          s.active = false;
        }
      }
      return null;
    },
    render(ctx) {
      for (const s of this.spikes) {
        if (!s.active) continue;
        const bob = Math.sin(this._t * 3 + s.tx) * 2;
        ctx.fillStyle = '#aa4444';
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const px = s.tx * TILE_SIZE + i * 10 + 6;
          const py = s.ty * TILE_SIZE + bob;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          ctx.lineTo(px + 4, py + 12);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    },
    interact() { return null; },
  };
}

function treasureRoom(map) {
  const spot = findSpot(map);
  if (!spot) return null;
  const roomTx = spot.tx - 2;
  const roomTy = spot.ty - 2;
  if (roomTx < 4 || roomTy < TUNNEL.CAVE_TOP) return null;
  for (let dy = 0; dy < 3; dy++) {
    for (let dx = 0; dx < 5; dx++) {
      map.set(roomTx + dx, roomTy + dy, TILE.AIR);
    }
  }
  for (let dx = 0; dx < 5; dx++) {
    map.set(roomTx + dx, roomTy + 3, TILE.STONE);
    map.set(roomTx + dx, roomTy - 1, TILE.STONE);
  }
  for (let dy = 0; dy < 3; dy++) {
    map.set(roomTx - 1, roomTy + dy, TILE.STONE);
    map.set(roomTx + 5, roomTy + dy, TILE.STONE);
  }
  return {
    type: 'treasure_room', x: spot.x, y: spot.y, w: 32, h: 32,
    active: true, dead: false,
    _opened: false,
    update(dt, player) {
      const px = player.x + player.w / 2;
      const py = player.y + player.h / 2;
      const dx = px - (this.x + 16);
      const dy = py - (this.y + 16);
      if (Math.sqrt(dx * dx + dy * dy) < 30 && !this._opened) {
        this._opened = true;
        this.active = false;
        setTimeout(() => { this.dead = true; }, 500);
        return 'reward';
      }
      return null;
    },
    render(ctx, cam, time) {
      if (this._opened) {
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(this.x + 4, this.y + 4, 24, 24);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('$', this.x + 16, this.y + 20);
        ctx.fillStyle = 'rgba(255,215,0,0.5)';
        ctx.font = '9px sans-serif';
        ctx.fillText('СОКРОВИЩЕ', this.x + 16, this.y + 44);
        return;
      }
      const s = 1 + Math.sin(time * 2) * 0.06;
      ctx.save();
      ctx.translate(this.x + 16, this.y + 16);
      ctx.scale(s, s);
      ctx.fillStyle = '#8B4513';
      ctx.shadowColor = '#654321';
      ctx.shadowBlur = 8;
      ctx.fillRect(-14, -12, 28, 24);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(-10, -8, 20, 16);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', 0, 4);
      ctx.restore();
    },
    interact(player, run, meta) {
      if (!this._opened) return null;
      if (Math.hypot(player.x + player.w / 2 - this.x, player.y + player.h / 2 - this.y) > 40) return null;
      run.oreBank.iron += 5;
      run.oreBank.crystal += 5;
      SaveManager.awardEtherSerum(meta, 2);
      audio.sfxBuy();
      this.dead = true;
      return '+5 Fe +5 Cr +2 Ether!';
    },
  };
}

function timeChallenge(map) {
  const spot = findSpot(map);
  if (!spot) return null;
  const duration = 30;
  return {
    type: 'time_challenge', x: spot.x, y: spot.y, w: 48, h: 48,
    active: true, dead: false,
    _started: false, _timer: duration, _done: false, _killCount: 0, _targetKills: 5,
    update(dt, player, m, run) {
      if (this._done) return null;
      if (!this._started) {
        const px = player.x + player.w / 2;
        const py = player.y + player.h / 2;
        if (Math.hypot(px - this.x, py - this.y) < 60) this._started = true;
        return null;
      }
      this._timer -= dt;
      if (this._timer <= 0 && !this._done) {
        this._done = true;
        this.active = false;
        if (this._killCount >= this._targetKills) {
          run.oreBank.iron += 8;
          run.oreBank.crystal += 8;
          SaveManager.awardEtherSerum(meta, 3);
          audio.sfxBuy();
          return 'УСПЕХ! +8 Fe, +8 Cr, +3 Ether!';
        }
        return 'ПРОВАЛ!';
      }
      if (run.kills > this._killCount + this._targetKills) {
        this._killCount += run.kills;
      }
      return null;
    },
    render(ctx, cam, time) {
      if (this._done) return;
      const glow = 0.3 + Math.sin(time * 2) * 0.15;
      ctx.fillStyle = `rgba(255, 200, 50, ${glow * 0.4})`;
      ctx.fillRect(this.x - 8, this.y - 8, this.w + 16, this.h + 16);
      ctx.fillStyle = '#ffcc33';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 12;
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      if (this._started) {
        ctx.fillText(`⚔ ${Math.max(0, Math.ceil(this._timer))}с`, this.x + this.w / 2, this.y + this.h / 2 + 4);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '8px sans-serif';
        ctx.fillText(`Убий: ${this._killCount}/${this._targetKills}`, this.x + this.w / 2, this.y + this.h + 18);
      } else {
        ctx.fillStyle = '#ffcc33';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('⚡', this.x + this.w / 2, this.y + this.h / 2 + 5);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '8px sans-serif';
        ctx.fillText('ИСПЫТАНИЕ', this.x + this.w / 2, this.y + this.h + 18);
      }
    },
    interact() { return null; },
  };
}
