const TILE_PX = 18;

class TileManager {
  load() {}
  isReady() { return true; }
  draw(_ctx, _name, _dx, _dy, _dw, _dh, ..._args) { return false; }
}

class MetalTileManager extends TileManager {
  constructor() {
    super();
    this.img = null;
  }

  load() {
    this.img = new Image();
    this.img.src = 'assets/tiles/tiles.png';
  }

  isReady() {
    return !!(this.img && this.img.complete && this.img.naturalWidth > 0);
  }

  draw(ctx, name, dx, dy, dw, dh, seed = 0) {
    if (!this.isReady()) return false;
    const map = {
      wall: [{col:0,row:0},{col:1,row:0},{col:2,row:0},{col:3,row:0}],
      floor: [{col:0,row:3},{col:1,row:3},{col:2,row:3},{col:3,row:3}],
      wallDark: [{col:8,row:0},{col:9,row:0}],
      floorDark: [{col:4,row:14},{col:5,row:14}],
      vent: [{col:6,row:4},{col:7,row:4}],
    };
    const variants = map[name];
    if (!variants) return false;
    const { col, row } = variants[Math.abs(seed) % variants.length];
    ctx.drawImage(this.img, col * TILE_PX, row * TILE_PX, TILE_PX, TILE_PX, dx, dy, dw, dh);
    return true;
  }

  drawAt(ctx, col, row, dx, dy, dw, dh) {
    if (!this.isReady()) return false;
    ctx.drawImage(this.img, col * TILE_PX, row * TILE_PX, TILE_PX, TILE_PX, dx, dy, dw, dh);
    return true;
  }
}

class BrickTileManager extends TileManager {
  constructor(colors) {
    super();
    this.c = colors;
  }

  draw(ctx, name, dx, dy, dw, dh) {
    ctx.fillStyle = this.c[name] || this.c.fill || '#888';
    ctx.fillRect(dx, dy, dw, dh);

    ctx.fillStyle = this.c.mortar || '#444';
    const brickW = Math.max(dw / 3, 5);
    const brickH = Math.max(dh / 2, 4);

    for (let by = 0; by <= dh; by += brickH) {
      const yy = dy + by;
      if (yy >= dy && yy < dy + dh) ctx.fillRect(dx, yy, dw, 1);
    }
    for (let by = 0; by < dh; by += brickH) {
      const rowOff = ((by / brickH) % 2) * (brickW / 2);
      for (let bx = -brickW; bx <= dw; bx += brickW) {
        const xx = dx + bx + rowOff;
        if (xx >= dx && xx < dx + dw) ctx.fillRect(xx, dy + by, 1, brickH);
      }
    }

    ctx.fillStyle = this.c.highlight || 'rgba(255,255,255,0.1)';
    ctx.fillRect(dx + 1, dy + 1, dw - 2, 1);
    ctx.fillRect(dx + 1, dy + 1, 1, dh - 2);

    return true;
  }
}

class IceTileManager extends BrickTileManager {
  drawDecor(ctx, tileIndex, dx, dy, dw, dh) {
    if (tileIndex >= 0 && tileIndex <= 2) {
      const h = dh * (0.6 + tileIndex * 0.12);
      ctx.fillStyle = 'rgba(180,230,255,0.3)';
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + dw / 2, dy + h);
      ctx.lineTo(dx + dw, dy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(220,245,255,0.2)';
      ctx.beginPath();
      ctx.moveTo(dx + dw * 0.2, dy);
      ctx.lineTo(dx + dw / 2, dy + h * 0.7);
      ctx.lineTo(dx + dw * 0.8, dy);
      ctx.closePath();
      ctx.fill();
      return true;
    }

    if (tileIndex >= 4 && tileIndex <= 7) {
      const i = tileIndex - 4;
      const h = dh * (0.5 + i * 0.08);
      ctx.fillStyle = 'rgba(200,240,255,0.35)';
      ctx.beginPath();
      ctx.moveTo(dx + 3, dy + dh);
      ctx.lineTo(dx + dw / 2, dy + dh - h);
      ctx.lineTo(dx + dw - 3, dy + dh);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(235,250,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(dx + dw * 0.3, dy + dh);
      ctx.lineTo(dx + dw / 2, dy + dh - h * 0.6);
      ctx.lineTo(dx + dw * 0.7, dy + dh);
      ctx.closePath();
      ctx.fill();
      return true;
    }

    if (tileIndex === 8 || tileIndex === 9) {
      ctx.fillStyle = 'rgba(170,215,235,0.12)';
      ctx.fillRect(dx + dw * 0.15, dy, dw * 0.7, dh);
      ctx.fillStyle = 'rgba(170,215,235,0.18)';
      ctx.fillRect(dx + dw * 0.3, dy + dh * 0.25, dw * 0.4, dh * 0.5);
      return true;
    }

    return false;
  }
}

class LavaTileManager extends BrickTileManager {
  drawTiled(ctx, name, dx, dy, dw, dh, offsetX = 0, offsetY = 0) {
    const ts = 16;
    const startTx = Math.floor(-offsetX / ts);
    const startTy = Math.floor(-offsetY / ts);
    const endTx = Math.ceil((dw - offsetX) / ts);
    const endTy = Math.ceil((dh - offsetY) / ts);
    for (let ty = startTy; ty < endTy; ty++) {
      for (let tx = startTx; tx < endTx; tx++) {
        this.draw(ctx, name, dx + offsetX + tx * ts, dy + offsetY + ty * ts, ts, ts);
      }
    }
    return true;
  }
}

export const metalTiles = new MetalTileManager();
export const iceTiles = new IceTileManager({
  ceiling: '#8ab8d8',
  wall: '#6a9aba',
  floor: '#7aaaca',
  mortar: '#4a7a9a',
  highlight: 'rgba(200,240,255,0.1)',
});
export const lavaTiles = new LavaTileManager({
  fill: '#7a3a28',
  mortar: '#4a2210',
  highlight: 'rgba(200,120,60,0.1)',
});
