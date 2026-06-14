export class Crate {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 28;
    this.h = 28;
    this.hp = 20;
    this.dead = false;
  }

  render(ctx) {
    if (this.dead) return;
    ctx.fillStyle = '#6a4e2a';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = '#4a3a1a';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = '#5a3e1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.w, this.y + this.h);
    ctx.moveTo(this.x + this.w, this.y);
    ctx.lineTo(this.x, this.y + this.h);
    ctx.stroke();
  }
}
