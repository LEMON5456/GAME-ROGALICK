import { BOSS } from '../data/enemies.js';
import { COLORS, COMBAT } from '../constants.js';
import { moveWithCollisions, center } from '../world/Physics.js';
import { Projectile } from './Projectile.js';
import { Enemy } from './Enemy.js';
import { PHYSICS } from '../constants.js';
import { sprites, SPRITES } from '../core/Sprites.js';
import { Animation, getWalkFrames } from '../core/Animations.js';

export class Boss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = BOSS.w;
    this.h = BOSS.h;
    this.hp = BOSS.hp;
    this.maxHp = BOSS.hp;
    this.damage = BOSS.damage;
    this.dead = false;
    this.phase = 1;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.moveDir = 1;
    this.fireCooldown = 2;
    this.spawnCooldown = BOSS.spawnInterval;
    this.defeated = false;
    this.phaseChanged = false;
    this.anim = new Animation(getWalkFrames(17, 153, 17, 2), 0.25);
  }

  get speed() {
    return this.phase === 2 ? BOSS.phase2Speed : BOSS.speed;
  }

  update(dt, map, player, projectiles, enemies) {
    if (this.dead) return;
    this.grounded = false;

    if (this.hp <= this.maxHp * 0.5 && this.phase === 1) {
      this.phase = 2;
      this.phaseChanged = true;
    }

    this.anim.update(dt);

    const pc = center(player);
    const bc = center(this);
    if (pc.x < bc.x) this.moveDir = -1;
    else this.moveDir = 1;

    this.vx = this.moveDir * this.speed;
    this.vy = Math.min(this.vy + PHYSICS.GRAVITY * dt, PHYSICS.MAX_FALL);
    moveWithCollisions(this, map, dt);

    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0) {
      this.fireCooldown = this.phase === 2 ? 1.2 : 2;
      const dx = pc.x - bc.x;
      const dy = pc.y - bc.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = COMBAT.PROJECTILE_SPEED * 0.55;
      projectiles.push(new Projectile(bc.x, bc.y - 10, dx / len, speed, 'boss', -200));
    }

    if (this.phase === 2) {
      this.spawnCooldown -= dt;
      if (this.spawnCooldown <= 0) {
        this.spawnCooldown = BOSS.spawnInterval;
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

    const pulse = 1 + Math.sin(time * 3) * 0.05;
    try {
      if (this.phase === 2) ctx.filter = 'hue-rotate(60deg) brightness(1.1)';
      const sprite = this.anim.getFrame();
      if (!sprites.drawBoss(ctx, sprite, this.x, this.y, this.w * pulse, this.h * pulse, this.moveDir < 0)) {
        ctx.fillStyle = this.phase === 2 ? '#60e080' : COLORS.boss;
        ctx.beginPath();
        ctx.ellipse(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } finally {
      ctx.filter = 'none';
    }

    const barW = 80;
    const barX = this.x + this.w / 2 - barW / 2;
    ctx.fillStyle = '#222';
    ctx.fillRect(barX, this.y - 14, barW, 8);
    ctx.fillStyle = '#4f4';
    ctx.fillRect(barX, this.y - 14, barW * (this.hp / this.maxHp), 8);
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Mould Titan', this.x + this.w / 2, this.y - 18);
  }
}

export function createBoss(map) {
  const x = map.width * 32 * 0.65;
  const floorY = 22 * 32;
  const y = floorY - BOSS.h;
  return new Boss(x, y);
}
