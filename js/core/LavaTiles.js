const TEX = {
  floor: 'assets/tiles/lava/lava_floor.jpg',
  wall: 'assets/tiles/lava/lava_wall.jpg',
  ceiling: 'assets/tiles/lava/lava_ceiling.jpg',
};

class LavaTilesManager {
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
    const img = this._images[name];
    if (!img || !img.complete || img.naturalWidth === 0) return false;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const sx = ox % iw;
    const sy = oy % ih;
    ctx.drawImage(img, sx, sy, dw, dh, dx, dy, dw, dh);
    return true;
  }

  drawTiled(ctx, name, dx, dy, dw, dh, offsetX = 0, offsetY = 0) {
    const img = this._images[name];
    if (!img || !img.complete || img.naturalWidth === 0) return false;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const startX = dx - (offsetX % iw);
    const startY = dy - (offsetY % ih);
    for (let y = startY; y < dy + dh; y += ih) {
      for (let x = startX; x < dx + dw; x += iw) {
        ctx.drawImage(img, x, y, iw, ih);
      }
    }
    return true;
  }
}

export const lavaTiles = new LavaTilesManager();
