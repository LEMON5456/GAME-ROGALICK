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
    const { x, y, w, h } = this;

    ctx.fillStyle = '#7a5e3a';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#6a4e2a';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

    ctx.strokeStyle = '#5a3e1a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.strokeStyle = '#4a2e1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + h);
    ctx.moveTo(x + w, y);
    ctx.lineTo(x, y + h);
    ctx.stroke();

    ctx.strokeStyle = '#4a2e1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);

    ctx.fillStyle = '#5a3e1a';
    ctx.fillRect(x + w / 2 - 1, y + 4, 2, h - 8);
    ctx.fillRect(x + 4, y + h / 2 - 1, w - 8, 2);

    ctx.fillStyle = '#4a2e1a';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}