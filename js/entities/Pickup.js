import { sprites, SPRITES } from '../core/Sprites.js';

const PICKUP_COLORS = {
  health: '#44dd66',
  shield: '#4488ff',
  speed: '#ffcc00',
  oreDrop: '#ddaa44',
};

const PICKUP_ICONS = {
  health: 'health',
  shield: 'shield',
  speed: 'speed',
  oreDrop: 'oreDrop',
};

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
    const color = PICKUP_COLORS[this.type] || '#ddaa44';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(this.x + 2, this.y + this.h - 2 + bob, this.w, 4);
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y + bob, this.w, this.h);

    if (this.type === 'shield') {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(this.x + 4, this.y + 4 + bob, this.w - 8, 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x + 3, this.y + 3 + bob, this.w - 6, this.h - 6);
    } else if (this.type === 'speed') {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.moveTo(this.x + 4, this.y + this.h - 4 + bob);
      ctx.lineTo(this.x + this.w - 4, this.y + this.h / 2 + bob);
      ctx.lineTo(this.x + 4, this.y + 4 + bob);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,200,0,0.2)';
    } else if (this.type === 'oreDrop') {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(this.x + 4, this.y + 4 + bob, this.w - 8, 2);
      ctx.fillRect(this.x + this.w / 2 - 1, this.y + 4 + bob, 2, this.h - 8);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(this.x + 4, this.y + 4 + bob, this.w - 8, 2);
      ctx.fillRect(this.x + this.w / 2 - 1, this.y + 4 + bob, 2, this.h - 8);
    }
  }
}
