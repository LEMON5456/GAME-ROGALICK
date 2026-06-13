import { TILE_SIZE } from '../constants.js';

export class Camera {
  constructor(viewWidth, viewHeight) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.x = 0;
    this.y = 0;
    this.worldWidth = 0;
    this.worldHeight = 0;
  }

  setWorldSize(tilesW, tilesH) {
    this.worldWidth = tilesW * TILE_SIZE;
    this.worldHeight = tilesH * TILE_SIZE;
  }

  follow(targetX, targetY, dt) {
    const targetCamX = targetX - this.viewWidth / 2;
    const targetCamY = targetY - this.viewHeight / 2;
    const lerp = Math.min(1, dt * 8);
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

  apply(ctx) {
    ctx.save();
    ctx.translate(-Math.floor(this.x), -Math.floor(this.y));
  }

  restore(ctx) {
    ctx.restore();
  }

  screenToWorld(sx, sy) {
    return { x: sx + this.x, y: sy + this.y };
  }
}
