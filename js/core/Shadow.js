export function drawShadow(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 2, w * 0.4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}
