import { aabbOverlap } from '../world/Physics.js';
import { getProjectileDamage } from '../entities/Projectile.js';
import { FloatingText } from '../entities/FloatingText.js';
import { audio } from '../core/Audio.js';

function spawnDamageText(x, y, dmg, color, list) {
  if (list) list.push(new FloatingText(x, y, '-' + dmg, color));
}

export class CombatSystem {
  update(player, enemies, boss, projectiles, run, dt, crates, floatTexts) {
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
        if (player.takeDamage(e.damage)) {
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
          else audio.sfxHit();
          break;
        }
      }

      if (boss && !boss.dead && aabbOverlap(p, boss)) {
        p.dead = true;
        boss.takeDamage(dmg);
        spawnDamageText(boss.x + boss.w / 2, boss.y, dmg, '#ff6600', floatTexts);
        if (boss.dead) audio.sfxEnemyDeath();
        else audio.sfxHit();
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

export function updateProjectiles(projectiles, map, dt, pool) {
  let writeIdx = 0;
  for (let i = 0; i < projectiles.length; i++) {
    const p = projectiles[i];
    if (!p.dead) {
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
