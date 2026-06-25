import { SPAWN } from '../constants.js';
import { aabbOverlap } from '../world/Physics.js';
import { getProjectileDamage } from '../entities/Projectile.js';
import { FloatingText } from '../entities/FloatingText.js';
import { audio } from '../core/Audio.js';

function spawnDamageText(x, y, dmg, color, list) {
  if (list) list.push(new FloatingText(x, y, '-' + dmg, color));
}

export class CombatSystem {
  constructor() {
    this.screenShake = 0;
  }

  update(player, enemies, boss, projectiles, run, dt, crates, floatTexts) {
    this.screenShake = Math.max(0, this.screenShake - dt);
    const hazardTimer = (this.hazardTimer || 0) - dt;
    this.hazardTimer = hazardTimer;

    for (const p of projectiles) {
      if (p.dead || p.owner === 'player') continue;
      if (aabbOverlap(p, player) && player.invincible <= 0) {
        p.dead = true;
        const dmg = getProjectileDamage(p.owner, run);
        spawnDamageText(player.x + player.w / 2, player.y, dmg, '#ff4444', floatTexts);
        audio.sfxHurt();
        if (player.takeDamage(dmg)) {
          return 'death';
        }
      }
    }

    for (const e of enemies) {
      if (e.dead) continue;
      if (e.contact && aabbOverlap(e, player)) {
        const dmg = e._buffed ? Math.round(e.damage * 1.5) : e.damage;
        if (player.takeDamage(dmg)) {
          audio.sfxHurt();
          return 'death';
        }
        audio.sfxHurt();
      }
    }

    if (boss && !boss.dead && aabbOverlap(boss, player)) {
      if (player.takeDamage(boss.damage)) {
        audio.sfxHurt();
        return 'death';
      }
      audio.sfxHurt();
    }

    for (const p of projectiles) {
      if (p.dead || p.owner !== 'player') continue;

      const dmg = getProjectileDamage('player', run);
      for (const e of enemies) {
        if (e.dead) continue;
        if (aabbOverlap(p, e)) {
          p.dead = true;
          e.takeDamage(dmg);
          spawnDamageText(e.x + e.w / 2, e.y, dmg, e.elite ? '#ffd700' : '#ffffff', floatTexts);
          if (e.dead) audio.sfxEnemyDeath();
          else { audio.sfxHit(); this.screenShake = 0.1; }
          break;
        }
      }

      if (boss && !boss.dead && aabbOverlap(p, boss)) {
        p.dead = true;
        boss.takeDamage(dmg);
        spawnDamageText(boss.x + boss.w / 2, boss.y, dmg, '#ff6600', floatTexts);
        if (boss.dead) audio.sfxEnemyDeath();
        else { audio.sfxHit(); this.screenShake = 0.15; }
      }

      if (crates && p.dead) continue;
      for (const c of crates || []) {
        if (c.dead) continue;
        if (aabbOverlap(p, c)) {
          p.dead = true;
          c.hp -= dmg;
          if (c.hp <= 0) c.dead = true;
          audio.sfxHit();
          break;
        }
      }
    }

    return null;
  }
}

export function updateProjectiles(projectiles, map, dt, pool, enemies) {
  let writeIdx = 0;
  for (let i = 0; i < projectiles.length; i++) {
    const p = projectiles[i];
    if (!p.dead) {
      if (!p._trail) p._trail = [];
      p._trail.push({ x: p.x, y: p.y });
      if (p._trail.length > 4) p._trail.shift();
      if (p.homing > 0 && p.owner === 'player' && enemies) {
        let nearest = null;
        let nearDist = SPAWN.HOMING_RADIUS;
        for (const e of enemies) {
          if (e.dead) continue;
          const dx = (e.x + e.w / 2) - (p.x + p.w / 2);
          const dy = (e.y + e.h / 2) - (p.y + p.h / 2);
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < nearDist) { nearDist = d; nearest = e; }
        }
        if (nearest && !nearest.dead) {
          const targetX = nearest.x + nearest.w / 2;
          const targetY = nearest.y + nearest.h / 2;
          const dx = targetX - (p.x + p.w / 2);
          const dy = targetY - (p.y + p.h / 2);
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > 1) {
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 200;
            const steer = SPAWN.HOMING_STEER;
            p.vx += (dx / d * speed - p.vx) * steer;
            p.vy += (dy / d * speed - p.vy) * steer;
          }
        }
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      const tx = Math.floor((p.x + p.w / 2) / 32);
      const ty = Math.floor((p.y + p.h / 2) / 32);
      const tile = map.get(tx, ty);
      if (map.isSolid(tile) && !map.isOre(tile)) p.dead = true;
      if (p.x < -100 || p.x > map.pixelWidth() + 100 || p.y > map.pixelHeight() + 100) p.dead = true;
      projectiles[writeIdx++] = p;
    } else if (pool) {
      pool.push(p);
    }
  }
  projectiles.length = writeIdx;
}
