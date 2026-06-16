const TILE_PX = 18;
const COLS = 23;

const TILE_MAP = {
  wall: [{col:0,row:0},{col:1,row:0},{col:2,row:0},{col:3,row:0}],
  floor: [{col:0,row:3},{col:1,row:3},{col:2,row:3},{col:3,row:3}],
  wallDark: [{col:8,row:0},{col:9,row:0}],
  floorDark: [{col:4,row:14},{col:5,row:14}],
  vent: [{col:6,row:4},{col:7,row:4}],
};

class MetalTiles {
  constructor() {
    this.img = null;
  }

  load() {
    this.img = new Image();
    this.img.src = 'assets/tiles/tiles.png';
  }

  draw(ctx, name, dx, dy, dw, dh, seed = 0) {
    if (!this.img || !this.img.complete || this.img.naturalWidth === 0) return false;
    const variants = TILE_MAP[name];
    if (!variants) return false;
    const idx = Math.abs(seed) % variants.length;
    const { col, row } = variants[idx];
    const sx = col * TILE_PX;
    const sy = row * TILE_PX;
    ctx.drawImage(this.img, sx, sy, TILE_PX, TILE_PX, dx, dy, dw, dh);
    return true;
  }

  drawAt(ctx, col, row, dx, dy, dw, dh) {
    if (!this.img || !this.img.complete || this.img.naturalWidth === 0) return false;
    ctx.drawImage(this.img, col * TILE_PX, row * TILE_PX, TILE_PX, TILE_PX, dx, dy, dw, dh);
    return true;
  }
}

export const metalTiles = new MetalTiles();
