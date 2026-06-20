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

    const worldW = 5000;
    const cx = px;
    const margin = 100;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 1800; i++) {
      const wx = ((i * 137 + 42) % worldW);
      if (wx < cx - margin || wx > cx + w + margin) continue;
      const wy = ((i * 251 + 89) % 1000) / 1000 * h;
      const size = 0.5 + ((i * 73 + 17) % 3) * 0.4;
      const tw = Math.max(0, Math.sin(time * (1.5 + (i % 5) * 0.5) + i * 2.7));
      ctx.fillRect(wx - cx, wy, size, size);
    }
    ctx.fillStyle = 'rgba(200, 220, 255, 0.35)';
    for (let i = 0; i < 600; i++) {
      const wx = ((i * 313 + 71) % worldW);
      if (wx < cx - margin || wx > cx + w + margin) continue;
      const wy = ((i * 509 + 43) % 1000) / 1000 * h;
      const size = 1 + ((i * 179 + 11) % 3);
      const tw = Math.max(0, Math.sin(time * (2 + (i % 3) * 0.7) + i * 3.1));
      ctx.fillRect(wx - cx, wy, size, size);
    }
    ctx.fillStyle = 'rgba(180, 200, 255, 0.6)';
    for (let i = 0; i < 200; i++) {
      const wx = ((i * 577 + 19) % worldW);
      if (wx < cx - margin || wx > cx + w + margin) continue;
      const wy = ((i * 823 + 67) % 1000) / 1000 * h;
      const size = 1.5 + ((i * 281 + 53) % 3) * 0.5;
      const tw = Math.max(0, Math.sin(time * (2.5 + (i % 4) * 0.4) + i * 4.3));
      ctx.fillRect(wx - cx, wy, size, size);
    }

    const nebula = [
      { wx: 500, wy: 0.3, rw: 250, rh: 100, c: 'rgba(80, 40, 140, 0.06)' },
      { wx: 1800, wy: 0.5, rw: 200, rh: 80, c: 'rgba(40, 60, 140, 0.05)' },
      { wx: 3000, wy: 0.2, rw: 180, rh: 120, c: 'rgba(140, 40, 80, 0.04)' },
      { wx: 4000, wy: 0.55, rw: 220, rh: 90, c: 'rgba(60, 20, 120, 0.05)' },
    ];
    for (const n of nebula) {
      if (n.wx + n.rw < cx - margin || n.wx - n.rw > cx + w + margin) continue;
      ctx.fillStyle = n.c;
      ctx.beginPath();
      ctx.ellipse(n.wx - cx + Math.sin(time * 0.08 + n.wx * 0.001) * 40, n.wy * h, n.rw, n.rh, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const planetWorldX = 2400;
    const planetScreenX = planetWorldX - cx + Math.sin(time * 0.1) * 30;
    ctx.fillStyle = 'rgba(80, 60, 120, 0.25)';
    ctx.beginPath();
    ctx.ellipse(planetScreenX, h * 0.22, 45, 32, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(120, 100, 160, ${0.15 + 0.05 * Math.sin(time * 0.3)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(planetScreenX, h * 0.22 + 3, 70, 14, 0.3, 0, Math.PI * 2);
    ctx.stroke();

    for (let c = 0; c < 3; c++) {
      const phase = c * 2.1;
      const t = (time * 0.06 + phase) % 12;
      const cx2 = t * w / 12 - 200;
      const cy2 = h * (0.05 + c * 0.08) + t * h * 0.035;
      const tailLen = 120 + Math.sin(t * 0.5 + c) * 30;
      const headX = cx2 + tailLen * 0.7;
      const headY = cy2 - tailLen * 0.35;
      if (headX < -100 || headX > w + 100) continue;
      const grad2 = ctx.createLinearGradient(cx2, cy2, headX, headY);
      grad2.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad2.addColorStop(0.6, 'rgba(200, 220, 255, 0.3)');
      grad2.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
      ctx.strokeStyle = grad2;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx2, cy2);
      ctx.lineTo(headX, headY);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(headX, headY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
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

    ctx.fillStyle = 'rgba(180, 220, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = -50; x <= w + 50; x += 20) {
      const rx = ((x - px * 0.05) % period + period) % period;
      const my = h * 0.28 + Math.sin(rx / period * Math.PI * 4) * 55
        + Math.sin(rx / period * Math.PI * 10) * 25 + Math.sin(rx / period * Math.PI * 20) * 10;
      ctx.lineTo(Math.max(0, Math.min(w, x)), Math.min(h, my - 8));
    }
    ctx.lineTo(w + 50, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(220, 240, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = -50; x <= w + 50; x += 20) {
      const rx = ((x - px * 0.05) % period + period) % period;
      const my = h * 0.28 + Math.sin(rx / period * Math.PI * 4) * 55
        + Math.sin(rx / period * Math.PI * 10) * 25 + Math.sin(rx / period * Math.PI * 20) * 10;
      ctx.lineTo(Math.max(0, Math.min(w, x)), Math.min(h, my - 14));
    }
    ctx.lineTo(w + 50, h);
    ctx.closePath();
    ctx.fill();

    for (let i = 0; i < 60; i++) {
      const sx = ((i * 379 + 53) % (w + 200)) - 100;
      const sy = ((i * 601 + 97) % 1000) / 1000 * h * 0.7;
      const ss = 1 + ((i * 173 + 29) % 3);
      const fall = Math.sin(time * 0.6 + i * 1.3 + sy * 0.01) * h * 0.02;
      ctx.fillStyle = `rgba(200, 230, 255, ${0.02 + ((i * 47 + 13) % 5) * 0.01})`;
      ctx.fillRect(sx, (sy + fall + sy * 0.02 * Math.sin(time * 0.3 + i)) % (h * 0.8), ss, ss);
    }
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

    for (let i = 0; i < 6; i++) {
      const lx = ((i * 239 + 31) % w);
      const lPeriod = 500;
      const rx = ((lx - px * 0.04) % lPeriod + lPeriod) % lPeriod;
      const baseY = h * 0.32 + Math.sin(rx / lPeriod * Math.PI * 3) * 55
        + Math.sin(rx / lPeriod * Math.PI * 8) * 22;
      const lw = 3 + ((i * 97 + 13) % 4);
      const lh = 50 + ((i * 163 + 41) % 60) + Math.sin(time * 0.5 + i * 1.1) * 10;
      const lxOff = ((i * 71 + 17) % 20) - 10;
      ctx.fillStyle = `rgba(255, ${90 + i * 20}, 20, ${0.12 + 0.06 * Math.sin(time * 0.7 + i * 1.3)})`;
      ctx.beginPath();
      ctx.ellipse(lx + lxOff - px * 0.04, baseY + lh * 0.4, lw, lh * 0.4, 0.1 + i * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 180, 60, ${0.06 + 0.04 * Math.sin(time * 0.9 + i * 0.7)})`;
      ctx.beginPath();
      ctx.ellipse(lx + lxOff - px * 0.04, baseY + lh * 0.45, lw * 0.5, lh * 0.2, 0.1 + i * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
