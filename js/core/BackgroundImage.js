export class BackgroundImage {
  constructor() {
    this._ready = {};
  }

  load(biome) {
    this._ready[biome] = true;
  }

  isReady(biome) {
    return !!this._ready[biome];
  }

  render(ctx, biome, camera, canvasW, canvasH, time = 0) {
    if (!this._ready[biome]) return;
    const px = camera ? camera.x : 0;
    if (biome === 'space') this._space(ctx, canvasW, canvasH, px, time);
    else if (biome === 'ice') this._ice(ctx, canvasW, canvasH, px, time);
    else if (biome === 'lava') this._lava(ctx, canvasW, canvasH, px, time);
  }

  _space(ctx, w, h, px, time) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0d1025');
    grad.addColorStop(1, '#1a2040');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 300; i++) {
      const sx = ((i * 137 + 42) % 1000) / 1000;
      const sy = ((i * 251 + 89) % 1000) / 1000;
      const size = 0.5 + ((i * 73 + 17) % 3) * 0.4;
      const tw = Math.max(0, Math.sin(time * (1.5 + (i % 5) * 0.5) + i * 2.7));
      const rx = ((sx * 1000 - px * 0.03) % w + w) % w;
      const ry = sy * h % h;
      ctx.fillRect(rx, ry, size, size);
    }
    ctx.fillStyle = 'rgba(200, 220, 255, 0.35)';
    for (let i = 0; i < 100; i++) {
      const sx = ((i * 313 + 71) % 1000) / 1000;
      const sy = ((i * 509 + 43) % 1000) / 1000;
      const size = 1 + ((i * 179 + 11) % 3);
      const tw = Math.max(0, Math.sin(time * (2 + (i % 3) * 0.7) + i * 3.1));
      const rx = ((sx * 1000 - px * 0.05) % w + w) % w;
      const ry = sy * h % h;
      ctx.fillRect(rx, ry, size, size);
    }
    ctx.fillStyle = 'rgba(180, 200, 255, 0.6)';
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 577 + 19) % 1000) / 1000;
      const sy = ((i * 823 + 67) % 1000) / 1000;
      const size = 1.5 + ((i * 281 + 53) % 3) * 0.5;
      const tw = Math.max(0, Math.sin(time * (2.5 + (i % 4) * 0.4) + i * 4.3));
      const rx = ((sx * 1000 - px * 0.04) % w + w) % w;
      const ry = sy * h % h;
      ctx.fillRect(rx, ry, size, size);
    }

    const nebula = [
      { ox: 0.2, oy: 0.3, rw: 250, rh: 100, c: 'rgba(80, 40, 140, 0.06)' },
      { ox: 0.6, oy: 0.5, rw: 200, rh: 80, c: 'rgba(40, 60, 140, 0.05)' },
      { ox: 0.8, oy: 0.2, rw: 180, rh: 120, c: 'rgba(140, 40, 80, 0.04)' },
    ];
    for (const n of nebula) {
      const nx = (n.ox * w - px * 0.01 + Math.sin(time * 0.08 + n.ox) * 40) % w;
      const ny = n.oy * h;
      ctx.fillStyle = n.c;
      ctx.beginPath();
      ctx.ellipse(nx, ny, n.rw, n.rh, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const plX = ((w * 0.5 - px * 0.015) % (w + 200) + w + 200) % (w + 200) - 100;
    ctx.fillStyle = 'rgba(80, 60, 120, 0.25)';
    ctx.beginPath();
    ctx.ellipse(plX, h * 0.22, 45, 32, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(120, 100, 160, ${0.15 + 0.05 * Math.sin(time * 0.3)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(plX, h * 0.22 + 3, 70, 14, 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }

  _ice(ctx, w, h, px, time) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0b1e3a');
    grad.addColorStop(1, '#1f4460');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const auroraColors = [
      'rgba(0, 255, 128, 0.035)',
      'rgba(0, 200, 255, 0.03)',
      'rgba(100, 255, 200, 0.025)',
      'rgba(0, 180, 100, 0.02)',
    ];
    for (let b = 0; b < 4; b++) {
      ctx.fillStyle = auroraColors[b];
      for (let x = 0; x < w; x += 6) {
        const wave = Math.sin(x * 0.008 + time * 0.25 + b * 1.7) * 25
          + Math.sin(x * 0.02 + time * 0.15 + b * 2.3) * 12;
        const baseY = h * 0.12 + b * 22 + Math.sin(time * 0.18 + b * 1.1) * 12;
        const h2 = 35 + Math.sin(x * 0.012 + time * 0.12 + b) * 12;
        ctx.fillRect(x, baseY + wave, 6, h2);
      }
    }

    const period = 600;
    ctx.fillStyle = 'rgba(20, 40, 60, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = -50; x <= w + 50; x += 20) {
      const rx = ((x - px * 0.05) % period + period) % period;
      const my = h * 0.28 + Math.sin(rx / period * Math.PI * 4) * 55
        + Math.sin(rx / period * Math.PI * 10) * 25 + Math.sin(rx / period * Math.PI * 20) * 10;
      ctx.lineTo(Math.max(0, Math.min(w, x)), Math.min(h, my));
    }
    ctx.lineTo(w + 50, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(180, 220, 255, 0.06)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = -50; x <= w + 50; x += 20) {
      const rx = ((x - px * 0.05) % period + period) % period;
      const my = h * 0.28 + Math.sin(rx / period * Math.PI * 4) * 55
        + Math.sin(rx / period * Math.PI * 10) * 25 + Math.sin(rx / period * Math.PI * 20) * 10;
      ctx.lineTo(Math.max(0, Math.min(w, x)), Math.min(h, my - 10));
    }
    ctx.lineTo(w + 50, h);
    ctx.closePath();
    ctx.fill();
  }

  _lava(ctx, w, h, px, time) {
    const pulse = 0.8 + 0.2 * Math.sin(time * 0.4);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a0a05');
    grad.addColorStop(0.5, `rgb(${Math.round(50 * pulse)}, ${Math.round(18 * pulse)}, 10)`);
    grad.addColorStop(1, '#3a1510');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const period = 700;
    ctx.fillStyle = 'rgba(25, 10, 6, 0.65)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = -50; x <= w + 50; x += 20) {
      const rx = ((x - px * 0.04) % period + period) % period;
      const vy = h * 0.32 + Math.sin(rx / period * Math.PI * 3) * 55
        + Math.sin(rx / period * Math.PI * 8) * 22;
      ctx.lineTo(Math.max(0, Math.min(w, x)), Math.min(h, vy));
    }
    ctx.lineTo(w + 50, h);
    ctx.closePath();
    ctx.fill();

    const craterX = ((200 - px * 0.04) % (w + 200) + w + 200) % (w + 200);
    const craterR = 20 + Math.sin(time * 0.8) * 4;
    ctx.fillStyle = `rgba(255, 120, 40, ${0.08 + 0.06 * Math.sin(time * 1.2)})`;
    ctx.beginPath();
    ctx.arc(craterX, h * 0.32 + Math.sin(200 / period * Math.PI * 3) * 55
      + Math.sin(200 / period * Math.PI * 8) * 22 - 8, craterR, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 10; i++) {
      const ex = (i * 131 + px * 0.015 * (1 + i * 0.1)) % w;
      const ey = (h * 0.15 + i * h * 0.07 + Math.sin(time * 0.4 + i * 1.7) * h * 0.08) % (h * 0.7);
      const es = 1.5 + Math.sin(time + i * 2.3) * 0.8;
      ctx.fillStyle = `rgba(255, ${130 + i * 8}, 30, ${0.03 + 0.025 * Math.sin(time * 0.6 + i)})`;
      ctx.beginPath();
      ctx.arc(ex, ey, Math.max(0.5, es), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
