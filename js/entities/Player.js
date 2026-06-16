import { PHYSICS, COMBAT, COLORS } from '../constants.js';
import { moveWithCollisions, isOnGround } from '../world/Physics.js';
import { fxSheets } from '../core/FXSheets.js';
import { Animation } from '../core/Animations.js';
import { audio } from '../core/Audio.js';

const FRAME_W = 100;
const FRAME_H = 100;
const FRAME_STEP = 100;
const FRAMES_IDLE = [0, 100, 200, 300, 400, 500];
const FRAMES_WALK = [0, 100, 200, 300, 400, 500, 600, 700];

const CROP_X = 36;
const CROP_Y = 31;
const CROP_W = 40;
const CROP_H = 29;
const SPRITE_SCALE = 2.8;

const SHEETS = {
  idle: 'assets/sprites/soldier/Soldier-Idle.png',
  run: 'assets/sprites/soldier/Soldier-Walk.png',
};

function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

export class Player {
  constructor() {
    this.w = 24;
    this.h = 36;
    this._sheets = {};
    this.reset();
    this.walkAnim = new Animation(FRAMES_WALK, 0.1);
    this.idleAnim = new Animation(FRAMES_IDLE, 0.15);
    this.currentAnim = this.idleAnim;
    Object.keys(SHEETS).forEach(k => { this._sheets[k] = loadImage(SHEETS[k]); });
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
    this.regenTimer = 0;
    this.lastHurtTime = 0;
    this.shield = 0;
    this.speedBoost = 0;
    this.ultimateCharge = 0;
    this.ultimateActive = 0;
    this.miningActive = false;
    this._footstepTimer = 0;
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

  update(input, map, dt, run, biome) {
    const canJump = this.grounded || isOnGround(this, map);
    this.grounded = false;
    this.invincible = Math.max(0, this.invincible - dt);
    this.ultimateActive = Math.max(0, this.ultimateActive - dt);
    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    this.lastHurtTime += dt;
    this.speedBoost = Math.max(0, this.speedBoost - dt);

    if (this.lastHurtTime > 2 && this.hp < this.maxHp) {
      this.regenTimer += dt;
      while (this.regenTimer >= 5) {
        this.regenTimer -= 5;
        this.hp = Math.min(this.hp + 1, this.maxHp);
      }
    } else if (this.lastHurtTime <= 2) {
      this.regenTimer = 0;
    }

    const speedMult = this.speedBoost > 0 ? 1.5 : 1;
    const friction = biome === 'ice' ? 0.85 : 1;
    let moving = false;
    if (input.left()) {
      this.vx = -PHYSICS.PLAYER_SPEED * speedMult;
      this.facing = -1;
      moving = true;
    } else if (input.right()) {
      this.vx = PHYSICS.PLAYER_SPEED * speedMult;
      this.facing = 1;
      moving = true;
    } else if (friction < 1) {
      this.vx *= friction;
      if (Math.abs(this.vx) < 10) this.vx = 0;
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

    if (moving && this.grounded && biome === 'space') {
      this._footstepTimer -= dt;
      if (this._footstepTimer <= 0) {
        this._footstepTimer = 0.35;
        audio.sfxWalk();
      }
    } else {
      this._footstepTimer = 0;
    }
  }

  addUltimateCharge(amount) {
    this.ultimateCharge = Math.min(100, this.ultimateCharge + amount);
  }

  useUltimate() {
    if (this.ultimateCharge < 100 || this.ultimateActive > 0) return false;
    this.ultimateCharge = 0;
    this.ultimateActive = 5;
    return true;
  }

  tryFire(spawn, camera) {
    if (this.fireCooldown > 0) return null;
    this.fireCooldown = this.ultimateActive > 0 ? COMBAT.PLAYER_FIRE_RATE * 0.4 : COMBAT.PLAYER_FIRE_RATE;
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    spawn(cx, cy, this.facing, COMBAT.PROJECTILE_SPEED, 'player');
    return { x: cx + this.facing * 15, y: cy };
  }

  takeDamage(amount) {
    if (this.invincible > 0) return false;
    if (this.shield > 0) {
      this.shield = 0;
      this.invincible = COMBAT.INVINCIBLE_TIME * 0.5;
      this.justHurt = true;
      this.lastHurtTime = 0;
      this.regenTimer = 0;
      return false;
    }
    this.hp -= amount;
    this.invincible = COMBAT.INVINCIBLE_TIME;
    this.justHurt = true;
    this.lastHurtTime = 0;
    this.regenTimer = 0;
    return this.hp <= 0;
  }

  loadPickaxe(src) {
    this.pickaxeImg = new Image();
    this.pickaxeImg.src = src;
  }

  _drawSprite(ctx, time) {
    const isMoving = this.currentAnim === this.walkAnim;
    const sheetKey = isMoving ? 'run' : 'idle';
    const img = this._sheets[sheetKey];
    if (!img || !img.complete || img.naturalWidth === 0) return false;

    const sx = this.currentAnim.getFrame() + CROP_X;
    const sy = CROP_Y;
    const sw = CROP_W;
    const sh = CROP_H;
    const scale = SPRITE_SCALE;
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = this.x + (this.w - dw) / 2;
    const dy = this.y + this.h - dh + Math.round(4 * SPRITE_SCALE);

    ctx.save();
    if (this.facing < 0) {
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
    } else {
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }
    ctx.restore();
    return true;
  }

  render(ctx, time) {
    const flash = this.invincible > 0 && Math.floor(time * 20) % 2 === 0;
    if (flash) ctx.globalAlpha = 0.4;

    if (!this._drawSprite(ctx, time)) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fillStyle = COLORS.player;
      ctx.fillRect(this.x, this.y + 8, this.w, this.h - 8);
      ctx.strokeRect(this.x, this.y + 8, this.w, this.h - 8);
      ctx.fillStyle = COLORS.playerHelmet;
      ctx.fillRect(this.x + 2, this.y, this.w - 4, 14);
    }

    ctx.globalAlpha = 1;

    if (this.miningActive && this.pickaxeImg && this.pickaxeImg.complete) {
      const px = this.x + this.w / 2 + this.facing * 8;
      const py = this.y + 8;
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(this.facing, 1);
      ctx.drawImage(this.pickaxeImg, -16, -16, 32, 32);
      ctx.restore();
    }

    if (this.ultimateActive > 0 && fxSheets.isReady()) {
      const frame = Math.floor(time * 15) % fxSheets.get('brightFire').totalFrames;
      fxSheets.drawFrame(ctx, 'brightFire', frame, this.x - 12, this.y - 12, this.w + 24, this.h + 24);
    }

    if (this.shield > 0) {
      if (fxSheets.isReady()) {
        const frame = Math.floor(time * 10) % fxSheets.get('protection').totalFrames;
        fxSheets.drawFrame(ctx, 'protection', frame, this.x - 8, this.y - 8, this.w + 16, this.h + 16);
      }
      ctx.strokeStyle = `rgba(68, 136, 255, ${0.3 + Math.sin(time * 5) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);
    }
  }
}
