import { MINING, TILE_SIZE, TILE } from '../constants.js';
import { dist } from '../world/Physics.js';
import { audio } from '../core/Audio.js';

export class MiningSystem {
  constructor() {
    this.active = false;
    this.targets = [];
    this._mineSoundCooldown = 0;
  }

  reset() {
    this.active = false;
    this.targets = [];
    this._mineSoundCooldown = 0;
  }

  miningPoint(player) {
    const px = player.x + player.w / 2 + player.facing * 20;
    const py = player.y + player.h * 0.65;
    return { px, py };
  }

  findNearbyOres(player, map, maxCount = 1) {
    const { px, py } = this.miningPoint(player);
    const range = MINING.RANGE;
    const rangeTiles = Math.ceil(range / TILE_SIZE);

    const ptx = Math.floor(px / TILE_SIZE);
    const pty = Math.floor(py / TILE_SIZE);

    const ores = [];

    for (let dy = -rangeTiles; dy <= rangeTiles; dy++) {
      for (let dx = -rangeTiles; dx <= rangeTiles; dx++) {
        const tx = ptx + dx;
        const ty = pty + dy;
        const tile = map.get(tx, ty);
        if (!map.isOre(tile)) continue;

        const ox = tx * TILE_SIZE + TILE_SIZE / 2;
        const oy = ty * TILE_SIZE + TILE_SIZE / 2;
        const d = dist(px, py, ox, oy);
        if (d >= range) continue;

        const facingBonus = (player.facing > 0 ? tx >= ptx : tx <= ptx) ? 0 : 12;
        ores.push({ tx, ty, type: map.oreType(tile), score: d + facingBonus });
      }
    }

    ores.sort((a, b) => a.score - b.score);
    return ores.slice(0, maxCount);
  }

  update(input, player, map, run, dt) {
    if (!input.action()) {
      this.reset();
      return null;
    }

    const maxCount = run.multiMineCount || 1;
    const ores = this.findNearbyOres(player, map, maxCount);
    if (ores.length === 0) {
      this.reset();
      return null;
    }

    this.targets = this.targets.filter(t => ores.some(o => o.tx === t.tx && o.ty === t.ty));
    for (const ore of ores) {
      if (!this.targets.some(t => t.tx === ore.tx && t.ty === ore.ty)) {
        this.targets.push({ tx: ore.tx, ty: ore.ty, type: ore.type, progress: 0 });
      }
    }

    this.active = true;
    const miningTime = MINING.BASE_TIME / (run.miningSpeedMult || 1);
    this._mineSoundCooldown -= dt;
    if (this._mineSoundCooldown <= 0) {
      this._mineSoundCooldown = 0.4;
      audio.sfxMine(0.35);
    }
    for (const t of this.targets) {
      t.progress += dt / miningTime;
    }

    for (const t of this.targets) {
      if (t.progress >= 1) {
        map.set(t.tx, t.ty, TILE.STONE);
        const result = { type: t.type, amount: 1 };
        this.targets = this.targets.filter(tt => tt !== t);
        if (this.targets.length === 0) this.active = false;
        return result;
      }
    }
    return null;
  }

  getProgress() {
    if (!this.active || this.targets.length === 0) return 0;
    return this.targets[0].progress;
  }
}

export function checkEvacuation(player, map) {
  const px = player.x + player.w / 2;
  const footY = player.y + player.h;
  const tx = Math.floor(px / TILE_SIZE);
  const ty = Math.floor(footY / TILE_SIZE);
  if (map.get(tx, ty) === TILE.EXIT_PAD) return true;
  const d = dist(px, footY, map.exitX, map.exitY);
  return d < 56;
}

export function checkHazardDamage(player, map) {
  const left = Math.floor(player.x / TILE_SIZE);
  const right = Math.floor((player.x + player.w) / TILE_SIZE);
  const top = Math.floor(player.y / TILE_SIZE);
  const bottom = Math.floor((player.y + player.h) / TILE_SIZE);

  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      if (map.get(tx, ty) === TILE.HAZARD) return 5;
    }
  }
  return 0;
}
