const PATHS = {
  space: 'assets/backgrounds/bg_space.jpg',
};

export class BackgroundImage {
  constructor() {
    this._images = {};
    this._loaded = {};
  }

  load(biome) {
    const path = PATHS[biome];
    if (!path || this._loaded[biome]) return;
    this._loaded[biome] = false;
    const img = new Image();
    img.onload = () => {
      this._images[biome] = img;
      this._loaded[biome] = true;
    };
    img.src = path;
  }

  isReady(biome) {
    return !!this._loaded[biome];
  }

  render(ctx, biome, camera, canvasW, canvasH) {
    const img = this._images[biome];
    if (!img) return;

    const parallaxX = (camera ? camera.x : 0) * 0.08;
    const parallaxY = (camera ? camera.y : 0) * 0.08;

    const imgW = img.width;
    const imgH = img.height;

    const scale = Math.max(canvasW / imgW, canvasH / imgH);
    const sw = imgW * scale;
    const sh = imgH * scale;

    const ox = -parallaxX % sw;
    const oy = -parallaxY % sh;

    ctx.drawImage(img, ox, oy, sw, sh);
    if (ox < 0) ctx.drawImage(img, ox + sw, oy, sw, sh);
    if (oy < 0) ctx.drawImage(img, ox, oy + sh, sw, sh);
    if (ox < 0 && oy < 0) ctx.drawImage(img, ox + sw, oy + sh, sw, sh);
  }
}
