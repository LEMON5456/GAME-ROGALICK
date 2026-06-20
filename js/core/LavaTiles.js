function hash(a, b) {
  return Math.abs(((a * 31 + b * 17) * 13 + b * 7)) % 1000;
}

class LavaTilesManager {
  constructor() {}

  load() {}

  isReady() { return true; }

  draw(ctx, name, dx, dy, dw, dh, ox = 0, oy = 0) {
    const s = ox + oy * 7;
    const r = 120 + ((s * 3) % 25);
    const g = 55 + ((s * 7) % 20);
    const b = 30 + ((s * 11) % 15);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(dx, dy, dw, dh);

    const m = 50 + ((s * 5) % 10);
    ctx.fillStyle = `rgb(${m},${m - 15},${m - 25})`;

    const brickW = Math.max(dw / 3, 5);
    const brickH = Math.max(dh / 2, 4);
    const xOff = ((s * 13) % 3);
    const yOff = ((s * 17) % 3);

    for (let by = 0; by <= dh; by += brickH) {
      const yy = dy + by + yOff;
      if (yy >= dy && yy < dy + dh) ctx.fillRect(dx, yy, dw, 1);
    }
    for (let by = 0; by < dh; by += brickH) {
      const rowOff = ((by / brickH) % 2) * (brickW / 2);
      const bxStart = Math.floor(-rowOff / brickW) * brickW;
      for (let bx = bxStart; bx <= dw; bx += brickW) {
        const xx = dx + bx + rowOff + xOff;
        if (xx >= dx && xx < dx + dw) ctx.fillRect(xx, dy + by, 1, brickH);
      }
    }

    const hR = Math.min(255, r + 30);
    const hG = Math.min(255, g + 20);
    const hB = Math.min(255, b + 10);
    ctx.fillStyle = `rgba(${hR},${hG},${hB},0.15)`;
    ctx.fillRect(dx + 1, dy + 1, dw - 2, 1);
    ctx.fillRect(dx + 1, dy + 1, 1, dh - 2);

    for (let i = 0; i < 3; i++) {
      const px = dx + ((s * 7 + i * 53) % (dw - 2)) + 1;
      const py = dy + ((s * 11 + i * 37) % (dh - 2)) + 1;
      const shade = 10 + ((s + i * 13) % 15);
      ctx.fillStyle = `rgba(0,0,0,${shade / 100})`;
      ctx.fillRect(px, py, 2, 2);
    }

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
