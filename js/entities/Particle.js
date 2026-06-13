export class Particle {
  constructor(x, y, vx, vy, color, life, size = 4) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 200 * dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  render(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

export function spawnMineParticles(x, y, color, particles) {
  for (let i = 0; i < 6; i++) {
    particles.push(new Particle(
      x + Math.random() * 20 - 10,
      y,
      (Math.random() - 0.5) * 120,
      -Math.random() * 100 - 30,
      color,
      0.5 + Math.random() * 0.3,
      3 + Math.random() * 3
    ));
  }
}

export function spawnDeathParticles(x, y, w, h, color, particles) {
  for (let i = 0; i < 12; i++) {
    particles.push(new Particle(
      x + Math.random() * w,
      y + Math.random() * h,
      (Math.random() - 0.5) * 200,
      -Math.random() * 150 - 50,
      color,
      0.4 + Math.random() * 0.4,
      3 + Math.random() * 4
    ));
  }
}

export function spawnMuzzleFlash(x, y, particles) {
  for (let i = 0; i < 3; i++) {
    particles.push(new Particle(
      x + (Math.random() - 0.5) * 6,
      y + (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 80,
      '#ffee60',
      0.1 + Math.random() * 0.1,
      4 + Math.random() * 4
    ));
  }
}
