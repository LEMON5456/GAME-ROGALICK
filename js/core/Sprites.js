export const SPRITE_SIZE = 16;
export const SPRITE_STRIDE = 17;
export const SPRITE_SCALE = 2.5;

export const SPRITES = {
  player: { x: 0, y: 85 },
  playerWalk1: { x: 17, y: 85 },
  crawler: { x: 0, y: 153 },
  crawlerWalk1: { x: 17, y: 153 },
  spitter: { x: 0, y: 119 },
  spitterWalk1: { x: 17, y: 119 },
  boss: { x: 17, y: 153 },
  bossAttack: { x: 34, y: 153 },
  flyer: { x: 0, y: 187 },
  flyer2: { x: 17, y: 187 },
  projectile: { x: 731, y: 102 },
  enemyProjectile: { x: 731, y: 119 },
  oreIron: { x: 714, y: 0 },
  oreCrystal: { x: 765, y: 34 },
  exit: { x: 561, y: 0 },
};

class SpriteAtlas {
  constructor() {
    this.image = null;
    this.loaded = false;
    this._loadPromise = null;
  }

  load() {
    if (this._loadPromise) return this._loadPromise;

    this._loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.image = img;
        this.loaded = true;
        resolve(this);
      };
      img.onerror = () => reject(new Error('Не удалось загрузить spritesheet'));
      img.src = 'assets/Spritesheet/roguelikeChar_transparent.png';
    });

    return this._loadPromise;
  }

  draw(ctx, sprite, dx, dy, dw, dh, flipX = false) {
    if (!this.loaded || !sprite) return false;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (flipX) {
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.image,
        sprite.x, sprite.y, SPRITE_SIZE, SPRITE_SIZE,
        0, 0, dw, dh
      );
    } else {
      ctx.drawImage(
        this.image,
        sprite.x, sprite.y, SPRITE_SIZE, SPRITE_SIZE,
        dx, dy, dw, dh
      );
    }

    ctx.restore();
    return true;
  }

  drawScaled(ctx, sprite, x, y, w, h, flipX = false) {
    const dw = SPRITE_SIZE * SPRITE_SCALE;
    const dh = SPRITE_SIZE * SPRITE_SCALE;
    const dx = x + (w - dw) / 2;
    const dy = y + h - dh;
    return this.draw(ctx, sprite, dx, dy, dw, dh, flipX);
  }

  drawBoss(ctx, sprite, x, y, w, h, flipX = false) {
    const scale = 4;
    const dw = SPRITE_SIZE * scale;
    const dh = SPRITE_SIZE * scale;
    const dx = x + (w - dw) / 2;
    const dy = y + h - dh;
    return this.draw(ctx, sprite, dx, dy, dw, dh, flipX);
  }

  drawIcon(ctx, sprite, x, y, size = 16) {
    return this.draw(ctx, sprite, x, y, size, size, false);
  }
}

export const sprites = new SpriteAtlas();
