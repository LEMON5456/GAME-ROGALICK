class IceTilesManager {
  constructor() {}

  load() {}

  isReady() { return true; }

  draw(ctx, name, dx, dy, dw, dh, ox = 0, oy = 0) {
    if (name === 'ceiling') {
      ctx.fillStyle = '#8ab8d8';
    } else if (name === 'wall') {
      ctx.fillStyle = '#6a9aba';
    } else {
      ctx.fillStyle = '#7aaaca';
    }
    ctx.fillRect(dx, dy, dw, dh);

    ctx.fillStyle = '#4a7a9a';

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

    ctx.fillStyle = 'rgba(200,240,255,0.1)';
    ctx.fillRect(dx + 1, dy + 1, dw - 2, 1);
    ctx.fillRect(dx + 1, dy + 1, 1, dh - 2);

    return true;
  }

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

export const iceTiles = new IceTilesManager();
