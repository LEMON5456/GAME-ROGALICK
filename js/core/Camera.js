import { TILE_SIZE } from '../constants.js';

export class Camera {
  constructor(viewWidth, viewHeight) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.x = 0;
    this.y = 0;
    this.worldWidth = 0;
    this.worldHeight = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeTime = 0;
  }

  setWorldSize(tilesW, tilesH) {
    this.worldWidth = tilesW * TILE_SIZE;
    this.worldHeight = tilesH * TILE_SIZE;
  }

  follow(targetX, targetY, dt) {
    const targetCamX = targetX - this.viewWidth / 2;
    const targetCamY = targetY - this.viewHeight / 2;
    const lerp = 1 - Math.pow(1 - 0.133, dt * 60);
    this.x += (targetCamX - this.x) * lerp;
    this.y += (targetCamY - this.y) * lerp;
    this.clamp();
  }

  clamp() {
    const maxX = Math.max(0, this.worldWidth - this.viewWidth);
    const maxY = Math.max(0, this.worldHeight - this.viewHeight);
    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.max(0, Math.min(this.y, maxY));
  }

  snapTo(targetX, targetY) {
    this.x = targetX - this.viewWidth / 2;
    this.y = targetY - this.viewHeight / 2;
    this.clamp();
  }

  resize(viewWidth, viewHeight) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.clamp();
  }

  shake(intensity = 4, duration = 0.15) {
    this.shakeX = intensity;
    this.shakeY = intensity;
    this.shakeTime = duration;
  }

  updateShake(dt) {
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const sx = (Math.random() - 0.5) * 2 * this.shakeX;
      const sy = (Math.random() - 0.5) * 2 * this.shakeY;
      this.shakeX *= 0.85;
      this.shakeY *= 0.85;
      return { x: sx, y: sy };
    }
    this.shakeX = 0;
    this.shakeY = 0;
    return { x: 0, y: 0 };
  }

  apply(ctx, dt) {
    ctx.save();
    const shake = this.updateShake(dt || 1 / 60);
    ctx.translate(-Math.floor(this.x + shake.x), -Math.floor(this.y + shake.y));
  }

  restore(ctx) {
    ctx.restore();
  }

}
