import { ENEMIES } from '../data/enemies.js';
import { COLORS, COMBAT } from '../constants.js';
import { moveWithCollisions, center, dist } from '../world/Physics.js';
import { PHYSICS } from '../constants.js';
import { sprites, SPRITES } from '../core/Sprites.js';
import { Animation, getWalkFrames } from '../core/Animations.js';

const ENEMY_SPRITES = {
  crawler: SPRITES.crawler,
  spitter: SPRITES.spitter,
};

const ORC_FRAMES = [0, 100, 200, 300, 400, 500];
let orcImg = null;
export function loadOrcSheet() {
  orcImg = new Image();
  orcImg.src = 'assets/sprites/orc/Orc-Walk.png';
}

export class Enemy {
  constructor(type, x, y, patrolDir = 1) {
    const def = ENEMIES[type];
    this.type = type;
    this.x = x;
    this.y = y;
    this.w = def.w;
    this.h = def.h;
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.damage = def.damage;
    this.speed = def.speed || 0;
    this.fireRate = def.fireRate || 0;
    this.range = def.range || 0;
    this.dead = false;
    this.patrolDir = patrolDir;
    this.fireCooldown = 1 + Math.random();
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.contact = def.contact || false;
    this.etherDrop = def.etherDrop || 0;
    this.anim = new Animation(getWalkFrames(0, this.type === 'spitter' ? 119 : 153, 17, 2), 0.2);
    if (type === 'orc') {
      this.anim = new Animation([0, 1, 2, 3, 4, 5], 0.12);
    }
  }

  update(dt, map, player, spawn) {
    if (this.dead) return;
    this.grounded = false;
    this.anim.update(dt);

    if (this.type === 'crawler') {
      this.vx = this.patrolDir * this.speed;
      this.vy = Math.min(this.vy + PHYSICS.GRAVITY * dt, PHYSICS.MAX_FALL);
      moveWithCollisions(this, map, dt);

      const aheadTx = Math.floor((this.x + this.w / 2 + this.patrolDir * 20) / 32);
      const footTy = Math.floor((this.y + this.h) / 32);
      const belowAhead = map.get(aheadTx, footTy + 1);
      const aheadTile = map.get(aheadTx, footTy);
      if (map.isSolid(aheadTile) || !map.isSolid(belowAhead)) {
        this.patrolDir *= -1;
      }
    } else if (this.type === 'spitter') {
      this.fireCooldown -= dt;
      const pc = center(player);
      const ec = center(this);
      const d = dist(ec.x, ec.y, pc.x, pc.y);
      if (d < this.range && this.fireCooldown <= 0) {
        this.fireCooldown = this.fireRate;
        const dx = pc.x - ec.x;
        const dy = pc.y - ec.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = COMBAT.PROJECTILE_SPEED * 0.7;
        spawn(ec.x, ec.y, dx / len, speed, 'spitter', dy / len * speed);
      }
    } else if (this.type === 'kamikaze') {
      const pc = center(player);
      const ec = center(this);
      const d = dist(ec.x, ec.y, pc.x, pc.y);
      if (d < 250) {
        const dx = pc.x - ec.x;
        const dy = pc.y - ec.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        this.vx = (dx / len) * this.speed;
        this.vy = (dy / len) * this.speed;
      } else {
        this.vx = this.patrolDir * this.speed * 0.5;
        this.vy = Math.min(this.vy + PHYSICS.GRAVITY * dt, PHYSICS.MAX_FALL);
      }
      moveWithCollisions(this, map, dt);
    } else if (this.type === 'orc') {
      this.fireCooldown -= dt;
      const pc = center(player);
      const ec = center(this);
      const d = dist(ec.x, ec.y, pc.x, pc.y);
      if (d < this.range && this.fireCooldown <= 0) {
        this.fireCooldown = this.fireRate;
        const dx = pc.x - ec.x;
        const dy = pc.y - ec.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = COMBAT.PROJECTILE_SPEED * 0.8;
        spawn(ec.x, ec.y, dx / len, speed, 'orc', dy / len * speed);
      }
      const dPlayer = dist(ec.x, ec.y, pc.x, pc.y);
      if (dPlayer < 300) {
        const dx = pc.x - ec.x;
        const dy = pc.y - ec.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        this.vx = (dx / len) * this.speed;
        this.vy = Math.min(this.vy + PHYSICS.GRAVITY * dt, PHYSICS.MAX_FALL);
      } else {
        this.vx = this.patrolDir * this.speed * 0.4;
        this.vy = Math.min(this.vy + PHYSICS.GRAVITY * dt, PHYSICS.MAX_FALL);
      }
      moveWithCollisions(this, map, dt);
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) this.dead = true;
  }

  render(ctx) {
    if (this.dead) return;

    if (this.type === 'orc' && orcImg && orcImg.complete && orcImg.naturalWidth > 0) {
      const frameIdx = this.anim.getFrame();
      ctx.save();
      ctx.drawImage(orcImg, ORC_FRAMES[frameIdx] + 44, 41, 22, 16, this.x - 4, this.y - 4, this.w + 8, this.h + 8);
      ctx.restore();
    } else {
      const sprite = this.anim.getFrame();
      const flip = this.type === 'crawler' ? this.patrolDir < 0 : false;
      if (!sprites.drawScaled(ctx, sprite, this.x, this.y, this.w, this.h, flip)) {
        ctx.fillStyle = this.type === 'crawler' ? COLORS.crawler : this.type === 'kamikaze' ? '#ff8040' : this.type === 'orc' ? '#4a8' : COLORS.spitter;
        ctx.fillRect(this.x, this.y, this.w, this.h);
      }
    }

    if (this.elite) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
    }

    if (this.elite || this.maxHp > 30) {
      const barW = this.w;
      ctx.fillStyle = '#333';
      ctx.fillRect(this.x, this.y - 6, barW, 4);
      ctx.fillStyle = this.elite ? '#ffd700' : '#f44';
      ctx.fillRect(this.x, this.y - 6, barW * (this.hp / this.maxHp), 4);
    }
  }
}

export function spawnEnemies(config, spawns) {
  const enemies = [];
  let idx = 0;
  for (const group of config.enemies) {
    for (let i = 0; i < group.count; i++) {
      const pos = spawns[idx] || { x: 400 + idx * 60, y: 200 };
      enemies.push(new Enemy(group.type, pos.x, pos.y, Math.random() > 0.5 ? 1 : -1));
      idx++;
    }
  }
  return enemies;
}
