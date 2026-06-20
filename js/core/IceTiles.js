const TEX = {
  terrain: 'assets/tiles/ice/terrain.png',
  entities: 'assets/tiles/ice/entities.png',
};

const TILE_W = 16;
const TILE_H = 16;
const COLS = 17;

// Row assignments in terrain sheet (17×10 grid)
const ROWS = {
  floor: 0,
  wall: [1, 2, 3],
  ceiling: 4,
};

class IceTilesManager {
  constructor() {
    this._loaded = {};
    this._images = {};
  }

  load() {
    for (const [key, src] of Object.entries(TEX)) {
      const img = new Image();
      img.onload = () => { this._loaded[key] = true; };
      img.onerror = () => { this._loaded[key] = false; };
      img.src = src;
      this._images[key] = img;
    }
  }

  isReady(name) {
    if (name) return !!this._loaded[name];
    return Object.keys(TEX).every(k => this._loaded[k]);
  }

  draw(ctx, name, dx, dy, dw, dh, ox = 0, oy = 0) {
    const img = this._images['terrain'];
    if (!img || !img.complete || img.naturalWidth === 0) return false;
    const cols = Math.floor(img.naturalWidth / TILE_W);
    const row = ROWS[name];
    let ty;
    if (Array.isArray(row)) {
      ty = row[Math.abs(Math.floor((ox + oy * 7) / 32)) % row.length];
    } else {
      ty = row;
    }
    const idx = Math.abs(Math.floor((ox + oy * 13) / 32)) % cols;
    ctx.drawImage(img, idx * TILE_W, ty * TILE_H, TILE_W, TILE_H, dx, dy, dw, dh);
    return true;
  }

  drawDecor(ctx, tileIndex, dx, dy, dw, dh) {
    const img = this._images['entities'];
    if (!img || !img.complete || img.naturalWidth === 0) return false;
    const cols = Math.floor(img.naturalWidth / TILE_W);
    const tx = tileIndex % cols;
    const ty = Math.floor(tileIndex / cols);
    ctx.drawImage(img, tx * TILE_W, ty * TILE_H, TILE_W, TILE_H, dx, dy, dw, dh);
    return true;
  }
}

export const iceTiles = new IceTilesManager();
