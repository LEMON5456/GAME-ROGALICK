import { findEnemySpawns } from '../world/PlanetGen.js';
import { spawnEnemies } from '../entities/Enemy.js';
import { Flyer } from '../entities/Flyer.js';
import { placeEntitySafely } from '../world/Physics.js';
import { audio } from '../core/Audio.js';

export function applyElite(e) {
  if (Math.random() < 0.15) {
    e.elite = true;
    e.maxHp = e.hp;
    e.hp = Math.round(e.hp * 2);
    e.damage = Math.round(e.damage * 1.5);
    e.etherDrop = (e.etherDrop || 0) + 1;
    audio.sfxEliteSpawn();
  }
  return e;
}

export function setupPlanetEnemies(planetConfig, map, run) {
  const enemies = [];
  const speedMult = run?.enemySpeedMult || 1;
  const hpMult = run?.enemyHpMult || 1;
  for (const group of planetConfig.enemies) {
    if (group.type === 'flyer') {
      for (let i = 0; i < group.count; i++) {
        const tx = 20 + Math.floor(Math.random() * (map.width - 40));
        const x = tx * 32;
        const y = 9 * 32 + Math.random() * 40;
        const f = new Flyer(x, y);
        f.speed *= speedMult; f.hp = Math.round(f.hp * hpMult); f.maxHp = f.hp;
        enemies.push(applyElite(f));
      }
    } else {
      const nonFlyerGroups = { enemies: [group] };
      const spawns = findEnemySpawns(map, group.count);
      const spawned = spawnEnemies(nonFlyerGroups, spawns);
      for (const e of spawned) {
        placeEntitySafely(e, map, e.x, e.y);
        e.speed *= speedMult; e.hp = Math.round(e.hp * hpMult); e.maxHp = e.hp;
        enemies.push(applyElite(e));
      }
    }
  }
  return enemies;
}
