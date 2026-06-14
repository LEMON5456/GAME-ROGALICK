import { TILE, TILE_SIZE, COLORS, TUNNEL } from '../constants.js';
import { sprites, SPRITES } from '../core/Sprites.js';
import { fxSheets } from '../core/FXSheets.js';
import { getBiome } from '../data/biomes.js';
import { iceAssets } from '../core/IceAssets.js';

export class TileMap {
  constructor(width, height, biome = 'space') {
    this.width = width;
    this.height = height;
    this.tiles = new Uint8Array(width * height);
    this.spawnX = TILE_SIZE * 2;
    this.spawnY = TILE_SIZE * 2;
    this.exitX = 0;
    this.exitY = 0;
    this.biome = biome;
  }

  setBiome(biome) {
    this.biome = biome;
  }

  getBiomeColors() {
    return getBiome(this.biome);
  }

  index(tx, ty) {
    return ty * this.width + tx;
  }

  inBounds(tx, ty) {
    return tx >= 0 && ty >= 0 && tx < this.width && ty < this.height;
  }

  get(tx, ty) {
    if (!this.inBounds(tx, ty)) return TILE.STONE;
    return this.tiles[this.index(tx, ty)];
  }

  set(tx, ty, value) {
    if (this.inBounds(tx, ty)) this.tiles[this.index(tx, ty)] = value;
  }

  isSolid(tile) {
    return tile !== TILE.AIR;
  }

  isOre(tile) {
    return tile === TILE.ORE_IRON || tile === TILE.ORE_CRYSTAL;
  }

  oreType(tile) {
    if (tile === TILE.ORE_IRON) return 'iron';
    if (tile === TILE.ORE_CRYSTAL) return 'crystal';
    return null;
  }

  pixelWidth() {
    return this.width * TILE_SIZE;
  }

  pixelHeight() {
    return this.height * TILE_SIZE;
  }

  _drawIceFrost(ctx, x, y, bc) {
    ctx.fillStyle = 'rgba(180, 230, 255, 0.12)';
    ctx.fillRect(x, y, TILE_SIZE, 2);
    ctx.fillRect(x, y + TILE_SIZE - 2, TILE_SIZE, 2);
    ctx.fillStyle = 'rgba(180, 230, 255, 0.06)';
    ctx.fillRect(x, y, 2, TILE_SIZE);
    ctx.fillRect(x + TILE_SIZE - 2, y, 2, TILE_SIZE);
  }

  _drawIceWallCrystal(ctx, x, y) {
    const cx = x + TILE_SIZE / 2;
    const cy = y + TILE_SIZE / 2;
    const offset = (x * 7 + y * 13) % 100;
    ctx.fillStyle = `rgba(200, 240, 255, ${0.08 + (offset % 3) * 0.04})`;
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + offset * 0.01;
      ctx.fillRect(cx + Math.cos(angle) * 10 - 1, cy + Math.sin(angle) * 10 - 1, 2, 10);
      ctx.fillRect(cx + Math.cos(angle + 0.3) * 6 - 1, cy + Math.sin(angle + 0.3) * 6 - 1, 2, 6);
    }
  }

  _drawIceFloor(ctx, x, y) {
    ctx.fillStyle = 'rgba(80, 170, 220, 0.2)';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = 'rgba(160, 230, 255, 0.15)';
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    const seed = (x * 17 + y * 31) % 100;
    ctx.strokeStyle = `rgba(200, 240, 255, ${0.08 + (seed % 5) * 0.02})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + seed % 12, y);
    ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
    ctx.lineTo(x + TILE_SIZE - (seed * 3) % 14, y + TILE_SIZE);
    ctx.stroke();
  }

  _drawIceStalagmite(ctx, x, y) {
    const seed = (x * 13 + y * 7) % 100;
    const crystalColor = seed % 3 === 0 ? 'rgba(180, 230, 255, 0.3)' : 'rgba(200, 240, 255, 0.2)';
    ctx.fillStyle = crystalColor;
    ctx.beginPath();
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + TILE_SIZE / 2, y - 8 - (seed % 6));
    ctx.lineTo(x + TILE_SIZE - 4, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + TILE_SIZE / 2, y - 4 - (seed % 4));
    ctx.lineTo(x + TILE_SIZE - 8, y);
    ctx.closePath();
    ctx.fill();
  }

  _drawSpacePanel(ctx, x, y) {
    const seed = (x * 17 + y * 31) % 100;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x, y + TILE_SIZE - 1, TILE_SIZE, 1);
    ctx.fillRect(x + TILE_SIZE - 1, y, 1, TILE_SIZE);
    if ((x + y) % 2 === 0) {
      ctx.fillRect(x, y, TILE_SIZE, 1);
      ctx.fillRect(x, y, 1, TILE_SIZE);
    }
    ctx.fillStyle = 'rgba(180, 195, 215, 0.3)';
    const rivets = [[2,2], [TILE_SIZE-2,2], [2,TILE_SIZE-2], [TILE_SIZE-2,TILE_SIZE-2]];
    for (const [rx, ry] of rivets) {
      ctx.beginPath();
      ctx.arc(x + rx, y + ry, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (seed > 80) {
      ctx.fillStyle = 'rgba(100, 140, 200, 0.15)';
      ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, 1);
      ctx.fillRect(x + 4, y + TILE_SIZE - 5, TILE_SIZE - 8, 1);
    }
  }

  _drawSpaceStarDust(ctx, x, y) {
    const seed = (x * 13 + y * 11) % 100;
    const count = 3 + (seed % 4);
    for (let i = 0; i < count; i++) {
      const sx = x + (seed * 7 + i * 13) % TILE_SIZE;
      const sy = y + (seed * 11 + i * 17) % TILE_SIZE;
      const size = 1 + (seed + i * 3) % 2;
      const bright = 0.15 + ((seed + i * 5) % 10) * 0.05;
      ctx.fillStyle = `rgba(200, 220, 255, ${bright})`;
      ctx.fillRect(sx, sy, size, size);
    }
  }

  _drawLavaEmber(ctx, x, y) {
    const seed = (x * 13 + y * 11) % 100;
    const t = performance.now() * 0.001;
    const count = 2 + (seed % 3);
    for (let i = 0; i < count; i++) {
      const ex = x + 2 + (seed * 7 + i * 13) % (TILE_SIZE - 4);
      const ey = y + 2 + (seed * 11 + i * 17) % (TILE_SIZE - 4);
      const size = 1.5 + ((seed + i * 3) % 3);
      const flicker = 0.5 + 0.5 * Math.sin(t * 3 + seed + i * 2.1);
      const ci = (seed + i * 7) % 3;
      ctx.fillStyle = ci === 0 ? `rgba(255, 200, 50, ${flicker * 0.6})`
        : ci === 1 ? `rgba(255, 100, 20, ${flicker * 0.5})`
        : `rgba(255, 60, 10, ${flicker * 0.4})`;
      ctx.beginPath();
      ctx.arc(ex, ey, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawLavaDrip(ctx, x, y) {
    const seed = (x * 17 + y * 7) % 100;
    if (seed % 3 !== 0) return;
    const t = performance.now() * 0.001;
    const baseY = y + TILE_SIZE;
    const phase = (t * 1.5 + seed) % 1;
    const dy = phase * TILE_SIZE * 0.7;
    const len = 2 + (seed % 2);
    ctx.fillStyle = `rgba(255, 120, 30, ${0.1 + 0.08 * Math.sin(t + seed)})`;
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE / 2, baseY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 170, 60, 0.6)';
    ctx.fillRect(x + TILE_SIZE / 2 - 0.5, baseY + dy, 1, len);
  }

  _drawLavaVent(ctx, x, y) {
    const seed = (x * 11 + y * 13) % 100;
    if (seed % 5 !== 0) return;
    const t = performance.now() * 0.001;
    const ventW = TILE_SIZE * 0.5;
    const ventH = 4;
    const vx = x + (TILE_SIZE - ventW) / 2;
    const vy = y + TILE_SIZE / 2 - ventH / 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(vx, vy, ventW, ventH);
    ctx.fillStyle = `rgba(255, 120, 30, ${0.08 + 0.06 * Math.sin(t * 2 + seed)})`;
    ctx.fillRect(vx - 2, vy - 2, ventW + 4, ventH + 4);
    for (let i = 0; i < 3; i++) {
      const wy = vy - 4 - (t * 1.5 + seed + i * 3) % (TILE_SIZE * 0.6);
      const wx = vx + ventW / 2 + Math.sin(t * 2 + seed + i) * 6;
      ctx.strokeStyle = `rgba(255, 200, 100, ${0.1 + 0.05 * Math.sin(t * 3 + seed + i * 2)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(wx, wy, 4, 0, Math.PI);
      ctx.stroke();
    }
  }

  render(ctx, camera) {
    const bc = this.getBiomeColors();
    const isIce = this.biome === 'ice';
    const startTx = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const startTy = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    const endTx = Math.min(this.width, Math.ceil((camera.x + camera.viewWidth) / TILE_SIZE) + 1);
    const endTy = Math.min(this.height, Math.ceil((camera.y + camera.viewHeight) / TILE_SIZE) + 1);

    for (let ty = startTy; ty < endTy; ty++) {
      for (let tx = startTx; tx < endTx; tx++) {
        const tile = this.get(tx, ty);
        if (tile === TILE.AIR) continue;
        const x = tx * TILE_SIZE;
        const y = ty * TILE_SIZE;
        switch (tile) {
          case TILE.STONE:
            ctx.fillStyle = (tx + ty) % 2 === 0 ? bc.stone : bc.stoneDark;
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            if (isIce) {
              this._drawIceFrost(ctx, x, y, bc);
              if (ty === TUNNEL.FLOOR_TY) {
                this._drawIceFloor(ctx, x, y);
                if ((tx * 7 + ty * 13) % 5 === 0) this._drawIceStalagmite(ctx, x, y);
              } else if ((tx * 7 + ty * 13) % 7 === 0) {
                this._drawIceWallCrystal(ctx, x, y);
              }
            }
            if (this.biome === 'space' && (ty === TUNNEL.FLOOR_TY || ty === TUNNEL.CEILING_TY)) {
              this._drawSpacePanel(ctx, x, y);
              this._drawSpaceStarDust(ctx, x, y);
            }
            if (this.biome === 'lava') {
              if (ty === TUNNEL.CEILING_TY) this._drawLavaDrip(ctx, x, y);
              if (ty === TUNNEL.FLOOR_TY) {
                this._drawLavaEmber(ctx, x, y);
                this._drawLavaVent(ctx, x, y);
              }
            }
            break;
          case TILE.ORE_IRON:
            ctx.fillStyle = bc.stoneDark;
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            if (isIce) {
              ctx.fillStyle = 'rgba(180, 220, 255, 0.15)';
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            }
            ctx.fillStyle = 'rgba(200, 120, 40, 0.35)';
            ctx.fillRect(x, y - 6, TILE_SIZE, 8);
            if (!sprites.drawIcon(ctx, SPRITES.oreIron, x + 4, y + 4, 24)) {
              ctx.fillStyle = COLORS.iron;
              ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            }
            break;
          case TILE.ORE_CRYSTAL:
            ctx.fillStyle = bc.stoneDark;
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            if (isIce) {
              ctx.fillStyle = 'rgba(200, 240, 255, 0.2)';
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            }
            ctx.fillStyle = 'rgba(64, 200, 232, 0.35)';
            ctx.fillRect(x, y - 6, TILE_SIZE, 8);
            if (!sprites.drawIcon(ctx, SPRITES.oreCrystal, x + 4, y + 4, 24)) {
              ctx.fillStyle = COLORS.crystal;
              ctx.fillRect(x + 4, y + 2, TILE_SIZE - 8, TILE_SIZE - 4);
            }
            break;
          case TILE.HAZARD:
            if (isIce) {
              ctx.fillStyle = 'rgba(160, 220, 255, 0.2)';
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#5a8aaa';
              ctx.beginPath();
              ctx.moveTo(x + 4, y + TILE_SIZE);
              ctx.lineTo(x + TILE_SIZE / 2, y + 2);
              ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE);
              ctx.closePath();
              ctx.fill();
              ctx.fillStyle = 'rgba(200, 240, 255, 0.25)';
              ctx.beginPath();
              ctx.moveTo(x + 8, y + TILE_SIZE - 4);
              ctx.lineTo(x + TILE_SIZE / 2, y + 6);
              ctx.lineTo(x + TILE_SIZE - 8, y + TILE_SIZE - 4);
              ctx.closePath();
              ctx.fill();
            } else if (this.biome === 'lava') {
              ctx.fillStyle = 'rgba(255, 80, 20, 0.3)';
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#d04010';
              ctx.beginPath();
              ctx.ellipse(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 12, 6, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = 'rgba(255, 200, 50, 0.3)';
              ctx.beginPath();
              ctx.ellipse(x + TILE_SIZE / 2 + 2, y + TILE_SIZE / 2 - 1, 6, 3, 0, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.fillStyle = bc.hazardGlow.replace('0.35', '0.5');
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = COLORS.hazard;
              ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            }
            if (fxSheets.isReady()) {
              if (this.biome === 'lava') {
                const frame = Math.floor(performance.now() * 0.008 + (tx + ty) * 7) % fxSheets.get('fire').totalFrames;
                fxSheets.drawFrame(ctx, 'fire', frame, x - 4, y - 4, TILE_SIZE + 8, TILE_SIZE + 8);
              } else if (this.biome === 'ice') {
                const frame = Math.floor(performance.now() * 0.008 + (tx + ty) * 7) % fxSheets.get('blueFire').totalFrames;
                fxSheets.drawFrame(ctx, 'blueFire', frame, x - 4, y - 4, TILE_SIZE + 8, TILE_SIZE + 8);
              }
            }
            break;
          case TILE.EXIT_PAD:
            ctx.fillStyle = COLORS.exitPad;
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = COLORS.exitGlow;
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            break;
        }
      }
    }
  }

  renderMarkers(ctx, time) {
    const pulse = 0.75 + Math.sin(time * 3) * 0.25;
    const ex = this.exitX;
    const ey = this.exitY;
    const portalH = (TUNNEL.CAVE_BOTTOM - TUNNEL.CAVE_TOP + 2) * TILE_SIZE;

    ctx.save();

    const isIce = this.biome === 'ice';

    if (isIce) {
      ctx.fillStyle = 'rgba(100, 200, 255, 0.12)';
      ctx.fillRect(ex - 40, ey - portalH, 8, portalH);
      ctx.fillRect(ex + 32, ey - portalH, 8, portalH);
      ctx.fillStyle = `rgba(160, 230, 255, ${0.15 + 0.1 * Math.sin(time * 2)})`;
      ctx.fillRect(ex - 42, ey - portalH, 12, portalH);
      ctx.fillRect(ex + 30, ey - portalH, 12, portalH);
      for (let i = 0; i < 4; i++) {
        const py = ey - portalH + i * (portalH / 4);
        ctx.fillStyle = `rgba(200, 240, 255, ${0.1 + 0.08 * Math.sin(time + i)})`;
        ctx.beginPath();
        ctx.moveTo(ex - 38, py);
        ctx.lineTo(ex - 34, py - 6);
        ctx.lineTo(ex - 30, py);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(ex + 30, py);
        ctx.lineTo(ex + 34, py - 6);
        ctx.lineTo(ex + 38, py);
        ctx.closePath();
        ctx.fill();
      }
    }

    const beamGrad = ctx.createLinearGradient(ex, ey - portalH, ex, ey);
    beamGrad.addColorStop(0, isIce ? 'rgba(100, 220, 255, 0)' : 'rgba(80, 255, 140, 0)');
    beamGrad.addColorStop(0.4, isIce ? `rgba(120, 230, 255, ${0.2 * pulse})` : `rgba(80, 255, 140, ${0.15 * pulse})`);
    beamGrad.addColorStop(1, isIce ? `rgba(160, 240, 255, ${0.4 * pulse})` : `rgba(80, 255, 140, ${0.35 * pulse})`);
    ctx.fillStyle = beamGrad;
    ctx.fillRect(ex - 28, ey - portalH, 56, portalH);

    ctx.strokeStyle = isIce ? `rgba(160, 240, 255, ${0.6 + pulse * 0.4})` : `rgba(120, 255, 180, ${0.6 + pulse * 0.4})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ex, ey - portalH * 0.45, 22 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = isIce ? `rgba(180, 240, 255, ${0.3 + pulse * 0.25})` : `rgba(100, 255, 160, ${0.25 + pulse * 0.2})`;
    ctx.beginPath();
    ctx.arc(ex, ey - portalH * 0.45, 14, 0, Math.PI * 2);
    ctx.fill();

    const arrowY = ey - portalH * 0.45 - 30 - Math.sin(time * 4) * 6;
    ctx.fillStyle = COLORS.exit;
    ctx.beginPath();
    ctx.moveTo(ex, arrowY);
    ctx.lineTo(ex - 12, arrowY + 16);
    ctx.lineTo(ex + 12, arrowY + 16);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isIce ? '#b0e8ff' : '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ВЫХОД', ex, arrowY - 10);

    ctx.font = '10px sans-serif';
    ctx.fillStyle = isIce ? 'rgba(180, 230, 255, 0.9)' : 'rgba(200,255,220,0.9)';
    ctx.fillText('E — эвакуация', ex, ey + 14);

    const size = 28 * pulse;
    if (sprites.drawIcon(ctx, SPRITES.exit, ex - size / 2, ey - size - 8, size)) {
      ctx.filter = 'none';
    }

    ctx.restore();
  }

  renderIceSprites(ctx, camera) {
    if (this.biome !== 'ice' || !iceAssets.isReady()) return;
    const bc = this.getBiomeColors();
    const startTx = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const endTx = Math.min(this.width, Math.ceil((camera.x + camera.viewWidth) / TILE_SIZE) + 1);

    for (let tx = startTx; tx < endTx; tx++) {
      const x = tx * TILE_SIZE;
      for (let ty = Math.max(0, TUNNEL.CEILING_TY - 1); ty < TUNNEL.FLOOR_TY + 2; ty++) {
        const tile = this.get(tx, ty);
        if (tile === TILE.HAZARD && ty <= TUNNEL.CAVE_TOP + 1) {
          iceAssets.draw(ctx, 'icicles', x, ty * TILE_SIZE - 8, TILE_SIZE, TILE_SIZE + 8);
        }
      }
    }
    iceAssets.draw(ctx, 'wall_left', -TILE_SIZE, TUNNEL.CEILING_TY * TILE_SIZE, TILE_SIZE + 32, (TUNNEL.FLOOR_TY + 1) * TILE_SIZE);
    iceAssets.draw(ctx, 'wall_right', (this.width - 1) * TILE_SIZE, TUNNEL.CEILING_TY * TILE_SIZE, TILE_SIZE + 32, (TUNNEL.FLOOR_TY + 1) * TILE_SIZE);

    for (let tx = startTx; tx < endTx; tx++) {
      const tile = this.get(tx, TUNNEL.FLOOR_TY);
      if (tile === TILE.STONE) {
        iceAssets.draw(ctx, 'floor', tx * TILE_SIZE, TUNNEL.FLOOR_TY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    for (let tx = startTx; tx < endTx; tx++) {
      const tile = this.get(tx, TUNNEL.CAVE_TOP);
      if (tile === TILE.AIR) {
        const below = this.get(tx, TUNNEL.CAVE_TOP + 1);
        if (below === TILE.AIR) {
          if ((tx * 7) % 11 === 0) {
            iceAssets.draw(ctx, 'crystal_small', tx * TILE_SIZE - TILE_SIZE, (TUNNEL.CAVE_TOP - 1) * TILE_SIZE, TILE_SIZE + 24, TILE_SIZE + 16);
          }
        }
      }
    }
  }

  renderMinimap(ctx, x, y, maxW, maxH, playerX, playerY) {
    const scale = Math.min(maxW / this.width, maxH / this.height);
    const mw = Math.ceil(this.width * scale);
    const mh = Math.ceil(this.height * scale);
    const ox = x + maxW - mw;
    const oy = y;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(ox - 2, oy - 2, mw + 4, mh + 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox - 2, oy - 2, mw + 4, mh + 4);

    for (let ty = 0; ty < this.height; ty++) {
      for (let tx = 0; tx < this.width; tx++) {
        const tile = this.get(tx, ty);
        if (tile === TILE.AIR) continue;
        const px = ox + tx * scale;
        const py = oy + ty * scale;
        const s = Math.max(1, Math.ceil(scale));
        if (tile === TILE.EXIT_PAD) {
          ctx.fillStyle = '#50ff80';
        } else if (this.isOre(tile)) {
          ctx.fillStyle = tile === TILE.ORE_IRON ? '#c87020' : '#40c8e8';
        } else if (tile === TILE.HAZARD) {
          ctx.fillStyle = '#8040a0';
        } else {
          ctx.fillStyle = '#4a4a5a';
        }
        ctx.fillRect(px, py, s, s);
      }
    }

    const px = ox + (playerX / TILE_SIZE) * scale;
    const py = oy + (playerY / TILE_SIZE) * scale;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px - 2, py - 2, 4, 4);
    ctx.fillStyle = '#80c0ff';
    ctx.fillRect(px - 1, py - 1, 2, 2);

    const ex = ox + (this.exitX / TILE_SIZE) * scale;
    const ey = oy + (this.exitY / TILE_SIZE) * scale;
    ctx.fillStyle = '#50ff80';
    ctx.beginPath();
    ctx.arc(ex, ey, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  renderMiningTargets(ctx, targets, time) {
    for (const t of targets) {
      const x = t.tx * TILE_SIZE;
      const y = t.ty * TILE_SIZE;
      const pulse = 0.5 + Math.sin(time * 8 + t.tx) * 0.3;
      ctx.strokeStyle = `rgba(255, 200, 50, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = `rgba(80, 80, 80, ${0.2 + 0.3 * (1 - t.progress)})`;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      if (t.progress > 0) {
        ctx.fillStyle = `rgba(255, 200, 50, ${0.08 * pulse})`;
        ctx.fillRect(x, y, TILE_SIZE * t.progress, TILE_SIZE);
      }
    }
  }

  renderFullMap(ctx, cw, ch, playerX, playerY, enemies, pickups) {
    const margin = 40;
    const mapW = cw - margin * 2;
    const mapH = ch - margin * 2;
    const scale = Math.min(mapW / this.width, mapH / this.height);
    const mw = Math.ceil(this.width * scale);
    const mh = Math.ceil(this.height * scale);
    const ox = (cw - mw) / 2;
    const oy = (ch - mh) / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(ox - 4, oy - 4, mw + 8, mh + 8);

    for (let ty = 0; ty < this.height; ty++) {
      for (let tx = 0; tx < this.width; tx++) {
        const tile = this.get(tx, ty);
        if (tile === TILE.AIR) continue;
        const px = ox + tx * scale;
        const py = oy + ty * scale;
        const s = Math.max(2, Math.ceil(scale));
        if (tile === TILE.EXIT_PAD) {
          ctx.fillStyle = '#50ff80';
        } else if (this.isOre(tile)) {
          ctx.fillStyle = tile === TILE.ORE_IRON ? '#c87020' : '#40c8e8';
        } else if (tile === TILE.HAZARD) {
          ctx.fillStyle = '#8040a0';
        } else {
          ctx.fillStyle = '#4a4a5a';
        }
        ctx.fillRect(px, py, s, s);
      }
    }

    for (const e of enemies) {
      if (e.dead) continue;
      ctx.fillStyle = '#e04040';
      ctx.fillRect(ox + (e.x / TILE_SIZE) * scale - 2, oy + (e.y / TILE_SIZE) * scale - 2, 5, 5);
    }
    for (const p of pickups) {
      if (p.dead) continue;
      ctx.fillStyle = '#40ff80';
      ctx.fillRect(ox + (p.x / TILE_SIZE) * scale - 1, oy + (p.y / TILE_SIZE) * scale - 1, 3, 3);
    }

    const px = ox + (playerX / TILE_SIZE) * scale;
    const py = oy + (playerY / TILE_SIZE) * scale;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#80c0ff';
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tab / M — закрыть карту', cw / 2, ch - 12);
  }
}
