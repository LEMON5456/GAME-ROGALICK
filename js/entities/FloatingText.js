export class FloatingText {
  constructor(x, y, text, color = '#ffffff', duration = 0.8) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.dead = false;
    this.life = duration;
    this.maxLife = duration;
  }

  update(dt) {
    this.y -= 40 * dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  render(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}
