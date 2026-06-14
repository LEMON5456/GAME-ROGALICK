import { SpriteSheet } from './SpriteSheet.js';

const FRAME = 100;

const SHEETS = {
  magicSpell:   'assets/fx/1_magicspell_spritesheet.png',
  magic8:       'assets/fx/2_magic8_spritesheet.png',
  blueFire:     'assets/fx/3_bluefire_spritesheet.png',
  casting:      'assets/fx/4_casting_spritesheet.png',
  magickaHit:   'assets/fx/5_magickahit_spritesheet.png',
  flameLash:    'assets/fx/6_flamelash_spritesheet.png',
  fireSpin:     'assets/fx/7_firespin_spritesheet.png',
  protection:   'assets/fx/8_protectioncircle_spritesheet.png',
  brightFire:   'assets/fx/9_brightfire_spritesheet.png',
  weaponHit:    'assets/fx/10_weaponhit_spritesheet.png',
  fire:         'assets/fx/11_fire_spritesheet.png',
  nebula:       'assets/fx/12_nebula_spritesheet.png',
  vortex:       'assets/fx/13_vortex_spritesheet.png',
  phantom:      'assets/fx/14_phantom_spritesheet.png',
  loading:      'assets/fx/15_loading_spritesheet.png',
  sunburn:      'assets/fx/16_sunburn_spritesheet.png',
  felSpell:     'assets/fx/17_felspell_spritesheet.png',
  midnight:     'assets/fx/18_midnight_spritesheet.png',
  freezing:     'assets/fx/19_freezing_spritesheet.png',
  magicBubbles: 'assets/fx/20_magicbubbles_spritesheet.png',
};

class FXSheetsManager {
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

export const fxSheets = new FXSheetsManager();
