import { ENEMIES } from '../data/enemies.js';
import { COMBAT } from '../constants.js';
import { center, dist } from '../world/Physics.js';
import { Projectile } from './Projectile.js';
import { sprites, SPRITES } from '../core/Sprites.js';
import { Animation, getWalkFrames } from '../core/Animations.js';
import { audio } from '../core/Audio.js';

export class Flyer {
  constructor(x, y) {
    const def = ENEMIES.flyer;
    this.type = 'flyer';
    this.x = x;
    this.y = y;
    this.w = def.w;
    this.h = def.h;
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.damage = def.damage;
    this.speed = def.speed;
    this.fireRate = def.fireRate;
    this.range = def.range;
    this.dead = false;
    this.contact = false;
    this.patrolDir = Math.random() > 0.5 ? 1 : -1;
    this.fireCooldown = 1 + Math.random();
    this.baseY = y;
    this.anim = new Animation(getWalkFrames(0, 187), 0.2);
  }

  update(dt, map, player, projectiles) {
    if (this.dead) return;
    this.anim.update(dt);

    this.x += this.patrolDir * this.speed * dt;

    this.y = this.baseY + Math.sin(this.x * 0.02) * 20;

    if (this.x < 32) this.patrolDir = 1;
    if (this.x > map.pixelWidth() - 32 - this.w) this.patrolDir = -1;

    this.fireCooldown -= dt;
    const pc = center(player);
    const fc = center(this);
    const d = dist(fc.x, fc.y, pc.x, pc.y);
    if (d < this.range && this.fireCooldown <= 0) {
      this.fireCooldown = this.fireRate;
      const dx = pc.x - fc.x;
      const dy = pc.y - fc.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = COMBAT.PROJECTILE_SPEED * 0.65;
      projectiles.push(new Projectile(fc.x, fc.y, dx / len, speed, 'flyer', dy / len * speed));
      audio.sfxFlyerShoot();
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) this.dead = true;
  }

  render(ctx) {
    if (this.dead) return;
    const frame = this.anim.getFrame();
    const flip = this.patrolDir < 0;
    if (!sprites.drawScaled(ctx, frame, this.x, this.y, this.w, this.h, flip)) {
      ctx.fillStyle = '#80c0f0';
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }
}
