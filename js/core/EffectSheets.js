import { SpriteSheet } from './SpriteSheet.js';

const FRAME = 16;

const SHEETS = {
  fire:  'assets/effects/Fire Effect and Bullet 16x16.png',
  green: 'assets/effects/Green Effect and Bullet 16x16.png',
  purple: 'assets/effects/Purple Effect and Bullet 16x16.png',
  water: 'assets/effects/Water Effect and Bullet 16x16.png',
};

class EffectSheetsManager {
  constructor() {
    this.sheets = {};
    this._loaded = false;
  }

  async load() {
    const entries = Object.entries(SHEETS);
    const results = await Promise.all(entries.map(([key, src]) => {
      const sheet = new SpriteSheet(src, FRAME, FRAME);
      return sheet.load().then(() => [key, sheet]);
    }));
    for (const [key, sheet] of results) {
      if (sheet) this.sheets[key] = sheet;
    }
    this._loaded = true;
  }

  get(name) {
    return this.sheets[name] || null;
  }

  isReady() {
    return this._loaded;
  }

  drawFrame(ctx, sheetName, index, dx, dy, dw, dh) {
    const sheet = this.sheets[sheetName];
    if (!sheet) return false;
    return sheet.draw(ctx, index, dx, dy, dw, dh);
  }
}

export const effectSheets = new EffectSheetsManager();
