class LavaTilesManager {
  constructor() {}

  load() {}

  isReady() { return true; }

  draw(ctx, name, dx, dy, dw, dh, ox = 0, oy = 0) {
    ctx.fillStyle = '#7a3a28';
    ctx.fillRect(dx, dy, dw, dh);

    ctx.fillStyle = '#4a2210';

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

    ctx.fillStyle = 'rgba(200,120,60,0.1)';
    ctx.fillRect(dx + 1, dy + 1, dw - 2, 1);
    ctx.fillRect(dx + 1, dy + 1, 1, dh - 2);

    return true;
  }

  drawTiled(ctx, name, dx, dy, dw, dh, offsetX = 0, offsetY = 0) {
    const ts = 16;
    const startTx = Math.floor(-offsetX / ts);
    const startTy = Math.floor(-offsetY / ts);
    const endTx = Math.ceil((dw - offsetX) / ts);
    const endTy = Math.ceil((dh - offsetY) / ts);
    for (let ty = startTy; ty < endTy; ty++) {
      for (let tx = startTx; tx < endTx; tx++) {
        this.draw(ctx, name, dx + offsetX + tx * ts, dy + offsetY + ty * ts, ts, ts, tx, ty);
      }
    }
    return true;
  }
}

export const lavaTiles = new LavaTilesManager();
