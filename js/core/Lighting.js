export class Lighting {
  constructor(canvas) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = canvas.width;
    this.canvas.height = canvas.height;
    this.ctx = this.canvas.getContext('2d');
    this.sources = [];
  }

  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
  }

  clear() {
    this.sources = [];
  }

  add(x, y, radius, color = [255, 255, 200], intensity = 0.5) {
    this.sources.push({ x, y, radius, color, intensity });
  }

  render(ctx, camera) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const c = this.ctx;

    c.clearRect(0, 0, w, h);

    c.fillStyle = 'rgba(0, 0, 0, 0.55)';
    c.fillRect(0, 0, w, h);

    for (const s of this.sources) {
      const sx = s.x - (camera ? camera.x : 0);
      const sy = s.y - (camera ? camera.y : 0);
      if (sx < -s.radius || sx > w + s.radius || sy < -s.radius || sy > h + s.radius) continue;

      const grad = c.createRadialGradient(sx, sy, 0, sx, sy, s.radius);
      const [r, g, b] = s.color;
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${s.intensity})`);
      grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${s.intensity * 0.6})`);
      grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${s.intensity * 0.2})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      c.globalCompositeOperation = 'destination-out';
      c.fillStyle = grad;
      c.beginPath();
      c.arc(sx, sy, s.radius, 0, Math.PI * 2);
      c.fill();
      c.globalCompositeOperation = 'source-over';

      c.globalCompositeOperation = 'lighter';
      const glow = c.createRadialGradient(sx, sy, 0, sx, sy, s.radius * 0.6);
      glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${s.intensity * 0.15})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = glow;
      c.beginPath();
      c.arc(sx, sy, s.radius * 0.6, 0, Math.PI * 2);
      c.fill();
      c.globalCompositeOperation = 'source-over';
    }

    ctx.drawImage(this.canvas, 0, 0);
  }
}
