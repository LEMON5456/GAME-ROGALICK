import { PHYSICS, COMBAT, COLORS } from '../constants.js';
import { moveWithCollisions, isOnGround } from '../world/Physics.js';
import { Projectile } from './Projectile.js';
import { sprites, SPRITES } from '../core/Sprites.js';
import { Animation, getWalkFrames } from '../core/Animations.js';

export class Player {
  constructor() {
    this.w = 24;
    this.h = 36;
    this.reset();
    this.walkAnim = new Animation(getWalkFrames(0, 85, 17, 2), 0.12);
    this.idleAnim = new Animation([{ x: 0, y: 85 }], 1, false);
    this.currentAnim = this.idleAnim;
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.facing = 1;
    this.fireCooldown = 0;
    this.invincible = 0;
    this.hp = 100;
    this.maxHp = 100;
    this.justHurt = false;
  }

  spawn(x, y, run) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.hp = run.hp;
    this.maxHp = run.maxHp;
    this.invincible = 0;
  }

  update(input, map, dt, run) {
    const canJump = this.grounded || isOnGround(this, map);
    this.grounded = false;
    this.invincible = Math.max(0, this.invincible - dt);
    this.fireCooldown = Math.max(0, this.fireCooldown - dt);

    let moving = false;
    if (input.left()) {
      this.vx = -PHYSICS.PLAYER_SPEED;
      this.facing = -1;
      moving = true;
    } else if (input.right()) {
      this.vx = PHYSICS.PLAYER_SPEED;
      this.facing = 1;
      moving = true;
    } else {
      this.vx = 0;
    }

    if (input.jump() && canJump) {
      this.vy = PHYSICS.PLAYER_JUMP;
      this.grounded = false;
    }

    this.vy = Math.min(this.vy + PHYSICS.GRAVITY * dt, PHYSICS.MAX_FALL);
    moveWithCollisions(this, map, dt);
    if (isOnGround(this, map)) this.grounded = true;

    this.currentAnim = moving && this.grounded ? this.walkAnim : this.idleAnim;
    this.currentAnim.update(dt);
  }

  tryFire(projectiles, camera) {
    if (this.fireCooldown > 0) return null;
    this.fireCooldown = COMBAT.PLAYER_FIRE_RATE;
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    projectiles.push(
      new Projectile(cx, cy, this.facing, COMBAT.PROJECTILE_SPEED, 'player')
    );
    return { x: cx + this.facing * 15, y: cy };
  }

  takeDamage(amount) {
    if (this.invincible > 0) return false;
    this.hp -= amount;
    this.invincible = COMBAT.INVINCIBLE_TIME;
    this.justHurt = true;
    return this.hp <= 0;
  }

  render(ctx, time) {
    const flash = this.invincible > 0 && Math.floor(time * 20) % 2 === 0;
    if (flash) ctx.globalAlpha = 0.4;

    const sprite = this.currentAnim.getFrame();
    if (!sprites.drawScaled(ctx, sprite, this.x, this.y, this.w, this.h, this.facing < 0)) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fillStyle = COLORS.player;
      ctx.fillRect(this.x, this.y + 8, this.w, this.h - 8);
      ctx.strokeRect(this.x, this.y + 8, this.w, this.h - 8);
      ctx.fillStyle = COLORS.playerHelmet;
      ctx.fillRect(this.x + 2, this.y, this.w - 4, 14);
    }

    ctx.globalAlpha = 1;
  }
}
