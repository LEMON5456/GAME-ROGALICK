import { COMBAT } from '../constants.js';
import { PHYSICS } from '../constants.js';
import { moveWithCollisions, center } from '../world/Physics.js';
import { drawShadow } from '../core/Shadow.js';

const ICE_BOSS = {
  w: 56,
  h: 48,
  hp: 400,
  damage: 22,
  speed: 70,
  phase2Speed: 100,
};

export class IceBoss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = ICE_BOSS.w;
    this.h = ICE_BOSS.h;
    this.hp = ICE_BOSS.hp;
    this.maxHp = ICE_BOSS.hp;
    this.damage = ICE_BOSS.damage;
    this.dead = false;
    this.phase = 1;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.moveDir = 1;
    this.fireCooldown = 2;
    this.defeated = false;
    this._freezeTimer = 0;
    this._chargeDir = 0;
    this._chargeSpeed = 0;
    this._chargeTime = 0;
  }

  get speed() {
    return this.phase === 2 ? ICE_BOSS.phase2Speed : ICE_BOSS.speed;
  }

  update(dt, map, player, spawn, enemies) {
    if (this.dead) return;
    if (this.hp <= this.maxHp * 0.5 && this.phase === 1) {
      this.phase = 2;
    }
    const pc = center(player);
    const bc = center(this);
    if (pc.x < bc.x) this.moveDir = -1;
    else this.moveDir = 1;

    if (this._chargeTime > 0) {
      this._chargeTime -= dt;
      this.vx = this._chargeDir * this._chargeSpeed;
      this.vy = Math.min(this.vy + PHYSICS.GRAVITY * dt, PHYSICS.MAX_FALL);
      moveWithCollisions(this, map, dt);
      if (this._chargeTime <= 0) this._chargeSpeed = 0;
      return;
    }

    this.vx = this.moveDir * this.speed;
    this.vy = Math.min(this.vy + PHYSICS.GRAVITY * dt, PHYSICS.MAX_FALL);
    moveWithCollisions(this, map, dt);

    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0) {
      if (this.phase === 2 && Math.random() < 0.4) {
        this._chargeDir = this.moveDir;
        this._chargeSpeed = this.phase === 2 ? 350 : 280;
        this._chargeTime = 0.6;
        this.fireCooldown = this.phase === 2 ? 1.5 : 2.5;
      } else {
        this.fireCooldown = this.phase === 2 ? 1.2 : 2;
        for (let i = -1; i <= 1; i++) {
          setTimeout(() => {
            if (!this.dead) spawn(bc.x, bc.y - 10, pc.x < bc.x ? -1 : 1, COMBAT.PROJECTILE_SPEED * 0.5, 'boss', i * 60);
          }, Math.abs(i) * 200);
        }
      }
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) { this.hp = 0; this.dead = true; this.defeated = true; }
  }

  render(ctx, time) {
    if (this.dead) return;

    drawShadow(ctx, this.x, this.y, this.w, this.h);

    const pulse = 1 + Math.sin(time * 3) * 0.04;
    ctx.fillStyle = this.phase === 2 ? '#80d0ff' : '#88ccff';
    ctx.shadowColor = '#44aaff';
    ctx.shadowBlur = 14;
    const w2 = (this.w / 2) * pulse;
    const h2 = (this.h / 2) * pulse;
    ctx.beginPath();
    ctx.ellipse(this.x + this.w / 2, this.y + this.h / 2, w2, h2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(this.x + this.w / 2 - 7, this.y + this.h / 2 - 5, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(this.x + this.w / 2 + 7, this.y + this.h / 2 - 5, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (this._chargeTime > 0) ctx.filter = 'brightness(1.3)';
    const barW = 80;
    const barX = this.x + this.w / 2 - barW / 2;
    ctx.fillStyle = '#222';
    ctx.fillRect(barX, this.y - 14, barW, 8);
    ctx.fillStyle = '#48f';
    ctx.fillRect(barX, this.y - 14, barW * (this.hp / this.maxHp), 8);
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ice Titan', this.x + this.w / 2, this.y - 18);
    ctx.filter = 'none';
  }
}

export function createIceBoss(map) {
  const x = map.width * 32 * 0.65;
  const floorY = 22 * 32;
  const y = floorY - ICE_BOSS.h;
  return new IceBoss(x, y);
}
