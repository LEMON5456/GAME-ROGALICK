import { aabbOverlap } from '../world/Physics.js';
import { getProjectileDamage } from '../entities/Projectile.js';
import { audio } from '../core/Audio.js';

export class CombatSystem {
  update(player, enemies, boss, projectiles, run, dt) {
    const hazardTimer = (this.hazardTimer || 0) - dt;
    this.hazardTimer = hazardTimer;

    for (const p of projectiles) {
      if (p.dead || p.owner === 'player') continue;
      if (aabbOverlap(p, player) && player.invincible <= 0) {
        p.dead = true;
        audio.sfxHurt();
        if (player.takeDamage(getProjectileDamage(p.owner, run))) {
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

      for (const e of enemies) {
        if (e.dead) continue;
        if (aabbOverlap(p, e)) {
          p.dead = true;
          e.takeDamage(getProjectileDamage('player', run));
          if (e.dead) audio.sfxEnemyDeath();
          else audio.sfxHit();
          break;
        }
      }

      if (boss && !boss.dead && aabbOverlap(p, boss)) {
        p.dead = true;
        boss.takeDamage(getProjectileDamage('player', run));
        if (boss.dead) audio.sfxEnemyDeath();
        else audio.sfxHit();
      }
    }

    return null;
  }
}

export function updateProjectiles(projectiles, map, dt) {
  for (const p of projectiles) {
    if (!p.dead) p.update(dt, map);
  }
  return projectiles.filter((p) => !p.dead);
}
