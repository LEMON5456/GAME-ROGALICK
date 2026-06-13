import { MINING, TILE_SIZE, TILE } from '../constants.js';
import { dist } from '../world/Physics.js';
import { audio } from '../core/Audio.js';

export class MiningSystem {
  constructor() {
    this.active = false;
    this.progress = 0;
    this.targetTx = -1;
    this.targetTy = -1;
    this.targetType = null;
  }

  reset() {
    this.active = false;
    this.progress = 0;
    this.targetTx = -1;
    this.targetTy = -1;
    this.targetType = null;
  }

  miningPoint(player) {
    const px = player.x + player.w / 2 + player.facing * 20;
    const py = player.y + player.h * 0.65;
    return { px, py };
  }

  findNearbyOre(player, map) {
    const { px, py } = this.miningPoint(player);
    const range = MINING.RANGE;
    const rangeTiles = Math.ceil(range / TILE_SIZE);

    const ptx = Math.floor(px / TILE_SIZE);
    const pty = Math.floor(py / TILE_SIZE);

    let closest = null;
    let closestScore = Infinity;

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
        const score = d + facingBonus;
        if (score < closestScore) {
          closestScore = score;
          closest = { tx, ty, type: map.oreType(tile) };
        }
      }
    }
    return closest;
  }

  update(input, player, map, run, dt) {
    if (!input.action()) {
      this.reset();
      return null;
    }

    const ore = this.findNearbyOre(player, map);
    if (!ore) {
      this.reset();
      return null;
    }

    if (this.targetTx !== ore.tx || this.targetTy !== ore.ty) {
      this.targetTx = ore.tx;
      this.targetTy = ore.ty;
      this.targetType = ore.type;
      this.progress = 0;
    }

    const miningTime = MINING.BASE_TIME / (run.miningSpeedMult || 1);
    this.progress += dt / miningTime;
    this.active = true;

    if (this.progress >= 1) {
      map.set(this.targetTx, this.targetTy, TILE.STONE);
      const result = { type: this.targetType, amount: 1 };
      this.reset();
      audio.sfxMine();
      return result;
    }
    return null;
  }

  getProgress() {
    return this.active ? this.progress : 0;
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
