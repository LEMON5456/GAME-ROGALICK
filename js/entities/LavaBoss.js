import { COMBAT } from '../constants.js';
import { PHYSICS } from '../constants.js';
import { moveWithCollisions, center } from '../world/Physics.js';
import { Enemy } from './Enemy.js';

const LAVA_BOSS = {
  w: 52,
  h: 48,
  hp: 450,
  damage: 25,
  speed: 90,
  phase2Speed: 120,
  spawnInterval: 5,
};

export class LavaBoss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = LAVA_BOSS.w;
    this.h = LAVA_BOSS.h;
    this.hp = LAVA_BOSS.hp;
    this.maxHp = LAVA_BOSS.hp;
    this.damage = LAVA_BOSS.damage;
    this.dead = false;
    this.phase = 1;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.moveDir = 1;
    this.fireCooldown = 1.5;
    this.spawnCooldown = LAVA_BOSS.spawnInterval;
    this.defeated = false;
    this.phaseChanged = false;
    this._jumpTimer = 3;
    this._jumping = false;
  }

  get speed() {
    return this.phase === 2 ? LAVA_BOSS.phase2Speed : LAVA_BOSS.speed;
  }

  update(dt, map, player, spawn, enemies) {
    if (this.dead) return;

    if (this.hp <= this.maxHp * 0.5 && this.phase === 1) {
      this.phase = 2;
      this.phaseChanged = true;
    }

    const pc = center(player);
    const bc = center(this);
    if (pc.x < bc.x) this.moveDir = -1;
    else this.moveDir = 1;

    this.grounded = false;
    this.vx = this.moveDir * this.speed;
    if (this._jumping) {
      this.vx *= 1.8;
    }
    this.vy = Math.min(this.vy + PHYSICS.GRAVITY * dt, PHYSICS.MAX_FALL);
    moveWithCollisions(this, map, dt);
    this._jumping = false;

    this._jumpTimer -= dt;
    if (this._jumpTimer <= 0 && this.grounded) {
      this.vy = -480;
      this._jumpTimer = this.phase === 2 ? 2.5 : 3.5;
      this._jumping = true;
    }

    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0) {
      this.fireCooldown = this.phase === 2 ? 1.5 : 2.5;
      const dx = pc.x - bc.x;
      const dy = pc.y - bc.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      spawn(bc.x, bc.y, dx / len, COMBAT.PROJECTILE_SPEED * 0.6, 'boss', -150);
    }

    if (this.phase === 2) {
      this.spawnCooldown -= dt;
      if (this.spawnCooldown <= 0) {
        this.spawnCooldown = LAVA_BOSS.spawnInterval;
        enemies.push(new Enemy('crawler', this.x, this.y, Math.random() > 0.5 ? 1 : -1));
      }
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.defeated = true;
    }
  }

  render(ctx, time) {
    if (this.dead) return;

    const pulse = 1 + Math.sin(time * 4) * 0.06;
    ctx.fillStyle = this.phase === 2 ? '#f08030' : '#d05020';
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.ellipse(this.x + this.w / 2, this.y + this.h / 2, (this.w / 2) * pulse, (this.h / 2) * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255, 200, 50, 0.4)';
    ctx.beginPath();
    ctx.ellipse(this.x + this.w / 2 - 6, this.y + this.h / 2 - 4, 6, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(this.x + this.w / 2 + 6, this.y + this.h / 2 - 4, 6, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const barW = 80;
    const barX = this.x + this.w / 2 - barW / 2;
    ctx.fillStyle = '#222';
    ctx.fillRect(barX, this.y - 14, barW, 8);
    ctx.fillStyle = '#f84';
    ctx.fillRect(barX, this.y - 14, barW * (this.hp / this.maxHp), 8);
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Lava Titan', this.x + this.w / 2, this.y - 18);
  }
}

export function createLavaBoss(map) {
  const x = map.width * 32 * 0.65;
  const floorY = 22 * 32;
  const y = floorY - LAVA_BOSS.h;
  return new LavaBoss(x, y);
}
