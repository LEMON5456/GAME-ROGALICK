import { sprites, SPRITES } from '../core/Sprites.js';

export class Pickup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 16;
    this.type = type;
    this.dead = false;
    this.bobTimer = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.bobTimer += dt * 2;
  }

  render(ctx) {
    if (this.dead) return;
    const bob = Math.sin(this.bobTimer) * 2;
    const color = this.type === 'health' ? '#44dd66' : '#ddaa44';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(this.x + 2, this.y + this.h - 2 + bob, this.w, 4);
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y + bob, this.w, this.h);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(this.x + 4, this.y + 4 + bob, this.w - 8, 2);
    ctx.fillRect(this.x + this.w / 2 - 1, this.y + 4 + bob, 2, this.h - 8);
    if (sprites.drawIcon(ctx, SPRITES.oreCrystal, this.x + 2, this.y + bob, this.w - 4)) {
    }
  }
}
