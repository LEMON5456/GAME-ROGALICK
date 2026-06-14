const SPRITES = {
  house:             { x: 344, y: 32, w: 160, h: 96 },
  platform_left:     { x: 0, y: 768, w: 180, h: 256 },
  platform_right:    { x: 832, y: 704, w: 192, h: 320 },
  floor:             { x: 256, y: 800, w: 512, h: 160 },
  wall_left:         { x: 0, y: 128, w: 160, h: 576 },
  wall_right:        { x: 864, y: 0, w: 160, h: 640 },
  crystal_small:     { x: 64, y: 576, w: 96, h: 128 },
  icicles:           { x: 256, y: 0, w: 512, h: 96 },
};

class IceAssetsManager {
  constructor() {
    this.loaded = false;
    this.canvases = {};
    this._load();
  }

  _load() {
    const img = new Image();
    img.onload = () => {
      for (const [name, r] of Object.entries(SPRITES)) {
        const c = document.createElement('canvas');
        c.width = r.w;
        c.height = r.h;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
        this.canvases[name] = c;
      }
      this.loaded = true;
    };
    img.onerror = () => {
      this.loaded = false;
    };
    img.src = 'assets/sprites/ice_biome.png';
  }

  isReady() {
    return this.loaded;
  }

  draw(ctx, name, dx, dy, dw, dh) {
    if (!this.loaded) return false;
    const c = this.canvases[name];
    if (!c) return false;
    ctx.drawImage(c, dx, dy, dw || c.width, dh || c.height);
    return true;
  }

  drawTiled(ctx, name, dx, dy, dw, dh) {
    if (!this.loaded) return false;
    const c = this.canvases[name];
    if (!c) return false;
    for (let y = dy; y < dy + dh; y += c.height) {
      for (let x = dx; x < dx + dw; x += c.width) {
        ctx.drawImage(c, x, y, Math.min(c.width, dx + dw - x), Math.min(c.height, dy + dh - y));
      }
    }
    return true;
  }
}

export const iceAssets = new IceAssetsManager();
export default iceAssets;
