import { SpriteSheet } from './SpriteSheet.js';

const PLANET_FILES = {
  terran: 'assets/planets/Terran.png',
  baren: 'assets/planets/Baren.png',
  black_hole: 'assets/planets/Black_hole.png',
  ice: 'assets/planets/Ice.png',
  lava: 'assets/planets/Lava.png',
};

const BIOME_MAP = {
  space: 'terran',
  ice: 'ice',
  lava: 'lava',
};

class PlanetIconsManager {
  constructor() {
    this._images = {};
    this._loaded = false;
  }

  async load() {
    const entries = Object.entries(PLANET_FILES);
    const results = await Promise.all(entries.map(([key, src]) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve([key, img]);
        img.onerror = () => resolve([key, null]);
        img.src = src;
      });
    }));
    for (const [key, img] of results) {
      if (img) this._images[key] = img;
    }
    this._loaded = true;
  }

  getByBiome(biome) {
    const key = BIOME_MAP[biome] || 'terran';
    return this._images[key] || null;
  }

  getByName(name) {
    return this._images[name] || null;
  }

  isReady() {
    return this._loaded;
  }

  draw(ctx, biome, dx, dy, size) {
    const img = this.getByBiome(biome);
    if (!img) return false;
    ctx.drawImage(img, dx, dy, size || 48, size || 48);
    return true;
  }

  drawByName(ctx, name, dx, dy, size) {
    const img = this.getByName(name);
    if (!img) return false;
    ctx.drawImage(img, dx, dy, size || 48, size || 48);
    return true;
  }
}

export const planetIcons = new PlanetIconsManager();
