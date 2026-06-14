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

export function spawnLandingParticles(x, y, particles) {
  for (let i = 0; i < 4; i++) {
    particles.push(new Particle(
      x + (Math.random() - 0.5) * 20,
      y,
      (Math.random() - 0.5) * 60,
      -Math.random() * 40,
      'rgba(180,180,200,0.6)',
      0.3 + Math.random() * 0.2,
      2 + Math.random() * 2
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

export class SnowParticle {
  constructor(x, y, speed, size, wind) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = size;
    this.wind = wind;
    this.phase = Math.random() * Math.PI * 2;
    this.dead = false;
  }

  update(dt, worldW, worldH) {
    this.phase += dt * 1.5;
    this.x += this.wind * dt + Math.sin(this.phase) * 10 * dt;
    this.y += this.speed * dt;
    if (this.y > worldH) {
      this.y = -10;
      this.x = Math.random() * worldW;
    }
    if (this.x < -20) this.x = worldW + 20;
    if (this.x > worldW + 20) this.x = -20;
  }

  render(ctx) {
    ctx.fillStyle = `rgba(220, 240, 255, ${0.4 + 0.3 * Math.sin(this.phase)})`;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

export function spawnSnow(width, height) {
  const particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push(new SnowParticle(
      Math.random() * width,
      Math.random() * height,
      20 + Math.random() * 30,
      1.5 + Math.random() * 2,
      -8 + Math.random() * 16
    ));
  }
  return particles;
}

export class EmberParticle {
  constructor(x, y, speed, size, drift) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = size;
    this.drift = drift;
    this.phase = Math.random() * Math.PI * 2;
    this.dead = false;
  }

  update(dt, worldW, worldH) {
    this.phase += dt * 2;
    this.x += this.drift * dt + Math.sin(this.phase) * 20 * dt;
    this.y -= this.speed * dt;
    if (this.y < -20) {
      this.y = worldH + 10;
      this.x = Math.random() * worldW;
    }
    if (this.x < -20) this.x = worldW + 20;
    if (this.x > worldW + 20) this.x = -20;
  }

  render(ctx) {
    const alpha = 0.5 + 0.4 * Math.sin(this.phase);
    ctx.fillStyle = `rgba(255, ${150 + 80 * Math.sin(this.phase)}, 30, ${alpha})`;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

export function spawnEmbers(width, height) {
  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push(new EmberParticle(
      Math.random() * width,
      Math.random() * height,
      15 + Math.random() * 25,
      1.5 + Math.random() * 2.5,
      -6 + Math.random() * 12
    ));
  }
  return particles;
}
