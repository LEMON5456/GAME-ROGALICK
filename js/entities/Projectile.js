import { COMBAT, COLORS } from '../constants.js';
import { sprites, SPRITES } from '../core/Sprites.js';

export class Projectile {
  constructor(cx, cy, dirX, speed, owner, vy = 0) {
    this.w = 10;
    this.h = 6;
    this.x = cx - this.w / 2;
    this.y = cy - this.h / 2;
    this.vx = dirX * speed;
    this.vy = vy;
    this.owner = owner;
    this.dead = false;
    this.gravity = owner === 'boss' ? 400 : 0;
  }

  update(dt, map) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.gravity) this.vy += this.gravity * dt;

    const tx = Math.floor((this.x + this.w / 2) / 32);
    const ty = Math.floor((this.y + this.h / 2) / 32);
    const tile = map.get(tx, ty);
    if (map.isSolid(tile) && !map.isOre(tile)) this.dead = true;

    if (this.x < -100 || this.x > map.pixelWidth() + 100 || this.y > map.pixelHeight() + 100) {
      this.dead = true;
    }
  }

  render(ctx) {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const sprite = this.owner === 'player' ? SPRITES.projectile : SPRITES.enemyProjectile;
    const size = 12;
    if (!sprites.drawIcon(ctx, sprite, cx - size / 2, cy - size / 2, size)) {
      ctx.fillStyle = this.owner === 'player' ? COLORS.projectile : COLORS.enemyProjectile;
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }
}

export function getProjectileDamage(owner, run) {
  if (owner === 'player') {
    return COMBAT.PLAYER_DAMAGE * (run?.damageMult || 1);
  }
  if (owner === 'spitter' || owner === 'flyer') return COMBAT.SPITTER_DAMAGE;
  if (owner === 'boss') return COMBAT.BOSS_DAMAGE;
  return 10;
}
