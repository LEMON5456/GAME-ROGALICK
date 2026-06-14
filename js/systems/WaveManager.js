import { Enemy } from '../entities/Enemy.js';
import { Flyer } from '../entities/Flyer.js';
import { audio } from '../core/Audio.js';

export class WaveManager {
  constructor() {
    this.waves = [];
    this._nextIndex = 0;
    this._lastWarningTime = 0;
    this.warningActive = false;
    this.waveActive = false;
    this._spawnFn = null;
  }

  reset(waveConfig, spawnEnemyFn) {
    this.waves = waveConfig || [];
    this._nextIndex = 0;
    this._lastWarningTime = -10;
    this.warningActive = false;
    this.waveActive = false;
    this._spawnFn = spawnEnemyFn;
  }

  update(elapsed, mapWidth, mapHeight) {
    this.warningActive = false;
    this.waveActive = false;

    if (this._nextIndex >= this.waves.length) return;

    const nextWave = this.waves[this._nextIndex];

    if (elapsed >= nextWave.delay - 3 && this._lastWarningTime < nextWave.delay - 3) {
      this.warningActive = true;
    }

    if (elapsed >= nextWave.delay) {
      this.waveActive = true;
      this._lastWarningTime = nextWave.delay;
      this._nextIndex++;

      for (const group of nextWave.enemies) {
        for (let i = 0; i < group.count; i++) {
          const fromRight = Math.random() < 0.5;
          const x = fromRight ? mapWidth - 60 : 20;
          const y = 9 * 32 + Math.random() * 60;
          if (group.type === 'flyer') {
            const flyer = new Flyer(x, y);
            if (Math.random() < 0.15) {
              flyer.elite = true;
              flyer.maxHp = flyer.hp;
              flyer.hp = Math.round(flyer.hp * 2);
              flyer.damage = Math.round(flyer.damage * 1.5);
              flyer.etherDrop = (flyer.etherDrop || 0) + 1;
              audio.sfxEliteSpawn();
            }
            if (this._spawnFn) this._spawnFn(flyer);
          } else {
            const enemy = new Enemy(group.type, x, y, fromRight ? -1 : 1);
            if (Math.random() < 0.15) {
              enemy.elite = true;
              enemy.maxHp = enemy.hp;
              enemy.hp = Math.round(enemy.hp * 2);
              enemy.damage = Math.round(enemy.damage * 1.5);
              enemy.etherDrop = (enemy.etherDrop || 0) + 1;
              audio.sfxEliteSpawn();
            }
            if (this._spawnFn) this._spawnFn(enemy);
          }
        }
      }
    }
  }
}
