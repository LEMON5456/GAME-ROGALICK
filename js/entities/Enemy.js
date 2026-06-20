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
const ORC_ATTACK_FRAMES = [0, 100, 200, 300, 400, 500];
const ORC_HURT_FRAMES = [0, 100, 200, 300];
const ORC_DEATH_FRAMES = [0, 100, 200, 300];

let orcWalkImg = null;
let orcAttackImg = null;
let orcHurtImg = null;
let orcDeathImg = null;

export function loadOrcSheet() {
  orcWalkImg = new Image();
  orcWalkImg.src = 'assets/sprites/orc/Orc-Walk.png';
  orcAttackImg = new Image();
  orcAttackImg.src = 'assets/sprites/orc/Orc-Attack01.png';
  orcHurtImg = new Image();
  orcHurtImg.src = 'assets/sprites/orc/Orc-Hurt.png';
  orcDeathImg = new Image();
  orcDeathImg.src = 'assets/sprites/orc/Orc-Death.png';
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
    this._hurtTimer = 0;
    this._deathTimer = 0;
    this._attackTimer = 0;
    this.anim = new Animation(getWalkFrames(0, this.type === 'spitter' ? 119 : 153, 17, 2), 0.2);
    if (type === 'orc') {
      this.anim = new Animation([0, 1, 2, 3, 4, 5], 0.12);
      this.orcAttackAnim = new Animation(ORC_ATTACK_FRAMES, 0.05);
      this.orcHurtAnim = new Animation(ORC_HURT_FRAMES, 0.08);
      this.orcDeathAnim = new Animation(ORC_DEATH_FRAMES, 0.1);
    }
    if (type === 'shield') {
      this._shieldTimer = 2 + Math.random() * 2;
      this._shieldActive = true;
      this._shieldCooldown = 3 + Math.random();
    }
    if (type === 'teleporter') {
      this._teleportCooldown = 2 + Math.random();
    }
    if (type === 'buffer') {
      this._buffCooldown = 3;
    }
  }

  update(dt, map, player, spawn) {
    if (this.dead) return;
    this.grounded = false;
    this.anim.update(dt);

    this._hurtTimer = Math.max(0, this._hurtTimer - dt);
    this._deathTimer = Math.max(0, this._deathTimer - dt);
    this._attackTimer = Math.max(0, this._attackTimer - dt);

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
        this._attackTimer = 0.3;
        if (this.orcAttackAnim) this.orcAttackAnim.reset();
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
    } else if (this.type === 'shield') {
      this._shieldTimer -= dt;
      if (this._shieldTimer <= 0) {
        if (this._shieldActive) {
          this._shieldActive = false;
          this._shieldTimer = this._shieldCooldown;
        } else {
          this._shieldActive = true;
          this._shieldTimer = 2 + Math.random() * 2;
          this._shieldCooldown = 3 + Math.random();
        }
      }
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
    } else if (this.type === 'teleporter') {
      this._teleportCooldown -= dt;
      if (this._teleportCooldown <= 0) {
        this._teleportCooldown = 2.5 + Math.random() * 1.5;
        const px = player.x + player.w / 2;
        const py = player.y + player.h / 2;
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 100;
        const tx = Math.max(32, Math.min(map.pixelWidth() - 32 - this.w, px + Math.cos(angle) * dist));
        const ty = Math.max(32, Math.min(map.pixelHeight() - 32 - this.h, py + Math.sin(angle) * dist));
        this.x = tx;
        this.y = ty;
        this.vx = 0;
        this.vy = 0;
      }
      this.fireCooldown -= dt;
      const pc = center(player);
      const tc = center(this);
      const d = dist(tc.x, tc.y, pc.x, pc.y);
      if (d < this.range && this.fireCooldown <= 0) {
        this.fireCooldown = this.fireRate;
        const dx = pc.x - tc.x;
        const dy = pc.y - tc.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = COMBAT.PROJECTILE_SPEED * 0.7;
        spawn(tc.x, tc.y, dx / len, speed, 'teleporter', dy / len * speed);
      }
    } else if (this.type === 'buffer') {
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
    }
  }

  takeDamage(amount) {
    if (this.type === 'shield' && this._shieldActive) return;
    this.hp -= amount;
    this._hurtTimer = 0.15;
    if (this.type === 'orc' && this.hp > 0) {
      this._hurtTimer = 0.3;
      if (this.orcHurtAnim) this.orcHurtAnim.reset();
    }
    if (this.hp <= 0) {
      this.dead = true;
      if (this.type === 'orc' && this.orcDeathAnim) {
        this._deathTimer = 0.5;
        this.orcDeathAnim.reset();
      }
    }
  }

  render(ctx) {
    if (this.dead) return;

    if (this.type === 'shield') {
      ctx.fillStyle = this._shieldActive ? '#4488cc' : '#6688aa';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      if (this._shieldActive) {
        ctx.strokeStyle = '#66ccff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + this.w / 2, this.y + this.h / 2, Math.max(this.w, this.h) * 0.7 + Math.sin(Date.now() * 0.01) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (this.type === 'teleporter') {
      ctx.fillStyle = '#b080ff';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.strokeStyle = '#d0a0ff';
      ctx.lineWidth = 2;
      const glow = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
      ctx.globalAlpha = glow;
      ctx.strokeRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);
      ctx.globalAlpha = 1;
    } else if (this.type === 'buffer') {
      ctx.fillStyle = '#66cc66';
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.fillStyle = '#88ee88';
      ctx.beginPath();
      ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      if (this._buffCooldown <= 0.5) {
        ctx.strokeStyle = '#aaffaa';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
      }
    } else if (this.type === 'orc') {
      let img = null;
      let frameOff = 0;
      if (this._deathTimer > 0 && orcDeathImg && orcDeathImg.complete) {
        img = orcDeathImg;
        frameOff = this.orcDeathAnim.getFrame();
        this.orcDeathAnim.update(1 / 60);
      } else if (this._hurtTimer > 0 && orcHurtImg && orcHurtImg.complete) {
        img = orcHurtImg;
        frameOff = this.orcHurtAnim.getFrame();
      } else if (this._attackTimer > 0 && orcAttackImg && orcAttackImg.complete) {
        img = orcAttackImg;
        frameOff = this.orcAttackAnim.getFrame();
      } else if (orcWalkImg && orcWalkImg.complete) {
        img = orcWalkImg;
        frameOff = this.anim.getFrame();
      }
      if (img) {
        const cropX = 44;
        const cropY = 41;
        const cropW = 22;
        const cropH = 16;
        ctx.save();
        if (this.vx < 0) {
          ctx.translate(this.x + this.w, this.y);
          ctx.scale(-1, 1);
          ctx.drawImage(img, frameOff + cropX, cropY, cropW, cropH, 0, 0, this.w, this.h);
        } else {
          ctx.drawImage(img, frameOff + cropX, cropY, cropW, cropH, this.x, this.y, this.w, this.h);
        }
        ctx.restore();
      } else {
        ctx.fillStyle = '#4a8';
        ctx.fillRect(this.x, this.y, this.w, this.h);
      }
    } else {
      const sprite = this.anim.getFrame();
      const flip = this.type === 'crawler' ? this.patrolDir < 0 : false;
      if (!sprites.drawScaled(ctx, sprite, this.x, this.y, this.w, this.h, flip)) {
        ctx.fillStyle = this.type === 'crawler' ? COLORS.crawler : this.type === 'kamikaze' ? '#ff8040' : this.type === 'orc' ? '#4a8' : COLORS.spitter;
        ctx.fillRect(this.x, this.y, this.w, this.h);
      }
      if (this._hurtTimer > 0) {
        ctx.fillStyle = `rgba(255,255,255,${this._hurtTimer * 2})`;
        ctx.fillRect(this.x, this.y, this.w, this.h);
      }
    }

    if (this._buffed) {
      ctx.strokeStyle = '#66ff66';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);
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
