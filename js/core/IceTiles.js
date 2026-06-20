const TILE_W = 16;
const TILE_H = 16;

function seed(a, b) {
  return Math.abs(((a * 31 + b * 17) * 13 + b * 7));
}

class IceTilesManager {
  constructor() {}

  load() {}

  isReady() { return true; }

  draw(ctx, name, dx, dy, dw, dh, ox = 0, oy = 0) {
    const s = seed(ox, oy);

    const isCeil = name === 'ceiling';
    const isWall = name === 'wall';

    let base = isCeil ? 180 : isWall ? 150 : 170;
    const r = base - 10 + ((s * 3) % 20);
    const g = base + 10 + ((s * 7) % 25);
    const b = base + 30 + ((s * 11) % 20);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(dx, dy, dw, dh);

    const mR = r - 20;
    const mG = g - 15;
    const mB = b - 10;
    ctx.fillStyle = `rgb(${mR},${mG},${mB})`;

    const brickW = Math.max(dw / 3, 5);
    const brickH = Math.max(dh / 2, 4);
    const xOff = ((s * 13) % 3) - 1;
    const yOff = ((s * 17) % 3) - 1;

    for (let by = 0; by <= dh; by += brickH) {
      const yy = dy + by + yOff;
      if (yy >= dy && yy < dy + dh) ctx.fillRect(dx, yy, dw, 1);
    }
    for (let by = 0; by < dh; by += brickH) {
      const rowOff = ((by / brickH) % 2) * (brickW / 2);
      for (let bx = -brickW; bx <= dw; bx += brickW) {
        const xx = dx + bx + rowOff + xOff;
        if (xx >= dx && xx < dx + dw) ctx.fillRect(xx, dy + by, 1, brickH);
      }
    }

    ctx.fillStyle = `rgba(220,245,255,${0.08 + ((s * 5) % 30) / 100})`;
    for (let i = 0; i < 4; i++) {
      const cx = dx + ((s * 7 + i * 53) % (dw - 2)) + 1;
      const cy = dy + ((s * 11 + i * 37) % (dh - 2)) + 1;
      ctx.fillRect(cx, cy, 2, 2);
      ctx.fillRect(cx + 1, cy - 1, 1, 1);
    }

    if (isWall && (s % 5 === 0)) {
      ctx.strokeStyle = `rgba(200,240,255,${0.05 + (s % 10) / 100})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 2; i++) {
        const lx = dx + ((s * 13 + i * 71) % (dw - 4)) + 2;
        const ly = dy + ((s * 17 + i * 43) % (dh - 6)) + 3;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + 2, ly + 4);
        ctx.lineTo(lx + 1, ly + 6);
        ctx.stroke();
      }
    }

    if (isCeil) {
      ctx.fillStyle = `rgba(220,245,255,${0.03 + (s % 5) / 100})`;
      for (let i = 0; i < 3; i++) {
        const fx = dx + ((s * 11 + i * 29) % (dw - 4)) + 2;
        ctx.fillRect(fx, dy, 1, 1 + (s + i * 7) % 3);
      }
    }

    return true;
  }

  drawDecor(ctx, tileIndex, dx, dy, dw, dh) {
    const s = seed(tileIndex * 17, 0);

    if (tileIndex >= 0 && tileIndex <= 2) {
      const h = dh * (0.6 + tileIndex * 0.12);
      const w = dw * 0.35;
      ctx.fillStyle = `rgba(190,235,255,${0.2 + tileIndex * 0.07})`;
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + dw / 2, dy + h);
      ctx.lineTo(dx + dw, dy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(220,245,255,${0.15 + tileIndex * 0.05})`;
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
      const tipOff = 3 + (i % 3);
      ctx.fillStyle = `rgba(200,240,255,${0.25 + i * 0.04})`;
      ctx.beginPath();
      ctx.moveTo(dx + tipOff, dy + dh);
      ctx.lineTo(dx + dw / 2, dy + dh - h);
      ctx.lineTo(dx + dw - tipOff, dy + dh);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(235,250,255,${0.2 + i * 0.03})`;
      ctx.beginPath();
      ctx.moveTo(dx + dw * 0.3, dy + dh);
      ctx.lineTo(dx + dw / 2, dy + dh - h * 0.6);
      ctx.lineTo(dx + dw * 0.7, dy + dh);
      ctx.closePath();
      ctx.fill();
      return true;
    }

    if (tileIndex === 8 || tileIndex === 9) {
      const shade = tileIndex === 8 ? '180,220,240' : '160,210,230';
      ctx.fillStyle = `rgba(${shade},${0.08 + (s % 10) / 100})`;
      ctx.fillRect(dx + dw * 0.15, dy, dw * 0.7, dh);
      ctx.fillStyle = `rgba(${shade},${0.12 + (s % 15) / 100})`;
      ctx.fillRect(dx + dw * 0.3, dy + dh * 0.25, dw * 0.4, dh * 0.5);
      return true;
    }

    return false;
  }
}

export const iceTiles = new IceTilesManager();
