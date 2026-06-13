import { TILE, TILE_SIZE, COLORS, TUNNEL } from '../constants.js';
import { sprites, SPRITES } from '../core/Sprites.js';
import { getBiome } from '../data/biomes.js';

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

  render(ctx, camera) {
    const bc = this.getBiomeColors();
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
            break;
          case TILE.ORE_IRON:
            ctx.fillStyle = bc.stoneDark;
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
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
            ctx.fillStyle = 'rgba(64, 200, 232, 0.35)';
            ctx.fillRect(x, y - 6, TILE_SIZE, 8);
            if (!sprites.drawIcon(ctx, SPRITES.oreCrystal, x + 4, y + 4, 24)) {
              ctx.fillStyle = COLORS.crystal;
              ctx.fillRect(x + 4, y + 2, TILE_SIZE - 8, TILE_SIZE - 4);
            }
            break;
          case TILE.HAZARD:
            ctx.fillStyle = bc.hazardGlow.replace('0.35', '0.5');
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = this.biome === 'ice' ? '#6a9ac0' : COLORS.hazard;
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
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

    const beamGrad = ctx.createLinearGradient(ex, ey - portalH, ex, ey);
    beamGrad.addColorStop(0, 'rgba(80, 255, 140, 0)');
    beamGrad.addColorStop(0.4, `rgba(80, 255, 140, ${0.15 * pulse})`);
    beamGrad.addColorStop(1, `rgba(80, 255, 140, ${0.35 * pulse})`);
    ctx.fillStyle = beamGrad;
    ctx.fillRect(ex - 28, ey - portalH, 56, portalH);

    ctx.strokeStyle = `rgba(120, 255, 180, ${0.6 + pulse * 0.4})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ex, ey - portalH * 0.45, 22 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(100, 255, 160, ${0.25 + pulse * 0.2})`;
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

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ВЫХОД', ex, arrowY - 10);

    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(200,255,220,0.9)';
    ctx.fillText('E — эвакуация', ex, ey + 14);

    const size = 28 * pulse;
    if (sprites.drawIcon(ctx, SPRITES.exit, ex - size / 2, ey - size - 8, size)) {
      ctx.filter = 'none';
    }

    ctx.restore();
  }
}
