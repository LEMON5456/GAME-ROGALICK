import { TILE, TILE_SIZE, TUNNEL } from '../constants.js';
import { fxSheets } from './SheetManager.js';
import { getBiome } from '../data/biomes.js';
import { renderProjectile } from '../entities/Projectile.js';

export function renderGame(game, dt) {
  const ctx = game.ctx;
  const w = game.canvas.width;
  const h = game.canvas.height;

  const bgKey = game.biome;
  const bc = getBiome(game.biome);
  if (game.bgImage && game.bgImage.isReady(bgKey)) {
    game.bgImage.render(ctx, bgKey, game.camera, w, h, game.time);
  }
  ctx.globalAlpha = 0.08;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, bc.sky1);
  grad.addColorStop(1, bc.sky2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;

  if (game.state !== 'planet' && game.state !== 'boss' && game.state !== 'paused') return;

  renderBackground(game, ctx, bc);
  game.camera.apply(ctx, dt);
  game.map.render(ctx, game.camera, game.time);
  game.map.renderIceSprites(ctx, game.camera);
  game.map.renderMarkers(ctx, game.time);
  if (fxSheets.isReady()) {
    const ex = game.map.exitX;
    const ey = game.map.exitY;
    const portalH = (TUNNEL.CAVE_BOTTOM - TUNNEL.CAVE_TOP + 2) * TILE_SIZE;
    const total = fxSheets.get('magicSpell')?.totalFrames ?? 1;
    const frame = Math.floor(game.time * 8) % total;
    const scale = portalH / 100;
    const sw = Math.round(100 * scale);
    const sh = Math.round(100 * scale);
    fxSheets.drawFrame(ctx, 'magicSpell', frame, ex - sw / 2, ey - sh, sw, sh);
  }
  game.map.renderMiningTargets(ctx, game.mining.targets, game.time);

  for (const e of game.enemies) e.render(ctx);
  for (const p of game.pickups) p.render(ctx);
  for (const c of game.crates) c.render(ctx);
  for (const ev of game.events) {
    if (ev.active && !ev.dead) ev.render(ctx);
  }
  if (game.boss) game.boss.render(ctx, game.time);
  game.player.render(ctx, game.time);
  for (const p of game.projectiles) renderProjectile(ctx, p, dt);
  for (const p of game.particles) p.render(ctx);
  for (const imp of game._impacts) {
    const total = fxSheets.get('weaponHit')?.totalFrames;
    if (total == null) continue;
    const idx = Math.floor((1 - imp.life / 0.25) * total);
    const size = 24;
    fxSheets.drawFrame(ctx, 'weaponHit', idx, imp.x - size / 2, imp.y - size / 2, size, size);
  }
  for (const t of game.floatingTexts) t.render(ctx);

  game.camera.restore(ctx);

  const darkMult = game.run ? (game.run.darknessMult || 1) : 1;
  game.lighting.clear();
  game.lighting.add(game.player.x + game.player.w / 2, game.player.y + game.player.h / 2, 180 * darkMult, [255, 220, 150], 0.6 * darkMult);
  if (game.map) {
    const cx = Math.floor((game.camera.x + game.canvas.width / 2) / 32);
    const cy = Math.floor((game.camera.y + game.canvas.height / 2) / 32);
    const viewTx = Math.ceil(game.canvas.width / 64);
    const viewTy = Math.ceil(game.canvas.height / 64);
    for (let tx = cx - viewTx; tx <= cx + viewTx; tx++) {
      for (let ty = cy - viewTy; ty <= cy + viewTy; ty++) {
        const tile = game.map.get(tx, ty);
        if (tile === TILE.ORE_IRON || tile === TILE.ORE_CRYSTAL) {
          game.lighting.add(tx * 32 + 16, ty * 32 + 16, 40, tile === TILE.ORE_CRYSTAL ? [100, 200, 255] : [255, 160, 80], 0.3);
        } else if (tile === TILE.EXIT_PAD) {
          game.lighting.add(game.map.exitX, game.map.exitY, 100, [80, 255, 160], 0.4);
        }
      }
    }
  }
  if (game.biome === 'ice') {
    for (let i = 0; i < 6; i++) {
      const lx = Math.random() * game.canvas.width;
      const ly = game.camera.y + Math.random() * game.canvas.height;
      game.lighting.add(lx, ly, 50, [120, 220, 255], 0.15);
    }
  }
  if (game.biome === 'lava') {
    for (let i = 0; i < 4; i++) {
      const lx = Math.random() * game.canvas.width;
      const ly = game.camera.y + Math.random() * game.canvas.height;
      game.lighting.add(lx, ly, 60, [255, 100, 30], 0.15);
    }
  }
  game.lighting.render(ctx, null);

  for (const s of game.snowParticles) s.render(ctx);

  drawExitBeacon(game, ctx);

  if (game.map && (game.state === 'planet' || game.state === 'boss')) {
    game.map.renderMinimap(ctx, game.canvas.width - 130, 8, 120, 80, game.player.x, game.player.y);
  }

  if (game.state === 'planet' && game.planetTimer.remaining <= 30) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.7);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(180,0,0,${0.15 + 0.1 * Math.sin(game.time * 4)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  if (game.state === 'boss') {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    const bossName = game.biome === 'lava' ? 'Lava Titan' : 'Mould Titan';
    ctx.fillText('Победите ' + bossName + '!', game.canvas.width / 2, 30);
  } else if (game.planetConfig) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(game.planetConfig.name, 16, 24);
  }

  if (game._mapVisible && game.map && (game.state === 'planet' || game.state === 'boss' || game.state === 'paused')) {
    game.map.renderFullMap(ctx, game.canvas.width, game.canvas.height, game.player.x, game.player.y, game.enemies, game.pickups);
  }

  if (game._damageVignette > 0) {
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.7);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, `rgba(180,0,0,${game._damageVignette * 0.5})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }

  if (game._fadeAlpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${game._fadeAlpha})`;
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
  }
}

function drawExitBeacon(game, ctx) {
  if (!game.map || game.state !== 'planet') return;
  const ex = game.map.exitX;
  const ey = game.map.exitY;
  const cx = game.camera.x + game.canvas.width / 2;
  const cy = game.camera.y + game.canvas.height / 2;
  const dx = ex - cx;
  const dy = ey - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 200) return;
  const angle = Math.atan2(dy, dx);
  const pad = 60;
  const hw = game.canvas.width / 2 - pad;
  const hh = game.canvas.height / 2 - pad;
  const t = Math.min(hw / Math.abs(Math.cos(angle) || 0.001), hh / Math.abs(Math.sin(angle) || 0.001));
  const bx = game.canvas.width / 2 + Math.cos(angle) * t;
  const by = game.canvas.height / 2 + Math.sin(angle) * t;
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(angle);
  const pulse = 0.7 + Math.sin(game.time * 3) * 0.3;
  ctx.fillStyle = `rgba(80, 255, 140, ${pulse})`;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(-6, -8);
  ctx.lineTo(-6, 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(80, 255, 140, ${0.5 + pulse * 0.3})`;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ВЫХОД', 0, -16);
  ctx.restore();
}

function renderBackground(game, ctx, bc) {
  const parallax1 = game.camera.x * 0.2;
  const parallax2 = game.camera.x * 0.4;
  const isIce = game.biome === 'ice';

  ctx.fillStyle = bc.parallaxColor1;
  ctx.fillRect(-parallax1 % 200 - 50, 80, 120, 40);
  ctx.fillRect(-parallax1 % 200 + 150, 120, 80, 30);

  ctx.fillStyle = bc.parallaxColor2;
  ctx.fillRect(-parallax2 % 300 - 80, 160, 160, 50);

  if (isIce) {
    for (let i = 0; i < 5; i++) {
      const px = (-parallax1 * (0.5 + i * 0.2) % 400 - 100 + i * 90 + 50) % game.canvas.width;
      const py = 40 + (i * 30 + Math.sin(game.time + i) * 10) % 140;
      ctx.fillStyle = `rgba(200, 240, 255, ${0.08 + Math.sin(game.time * 0.5 + i) * 0.04})`;
      ctx.beginPath();
      ctx.moveTo(px, py - 10);
      ctx.lineTo(px - 4, py + 6);
      ctx.lineTo(px + 4, py + 6);
      ctx.closePath();
      ctx.fill();
    }

    const w = game.canvas.width;
    const h = game.canvas.height;
    for (let side = 0; side < 2; side++) {
      const baseX = side === 0 ? -parallax1 * 0.3 % 100 - 40 : w + parallax1 * 0.3 % 100 - 60;
      const fallGrad = ctx.createLinearGradient(baseX, 0, baseX + 50, 0);
      fallGrad.addColorStop(0, 'rgba(160, 230, 255, 0)');
      fallGrad.addColorStop(0.3, `rgba(180, 240, 255, ${0.08 + 0.05 * Math.sin(game.time * 0.5)})`);
      fallGrad.addColorStop(0.7, `rgba(160, 230, 255, ${0.06 + 0.04 * Math.sin(game.time * 0.3 + 1)})`);
      fallGrad.addColorStop(1, 'rgba(160, 230, 255, 0)');
      ctx.fillStyle = fallGrad;
      ctx.fillRect(baseX, 20, 50, h * 0.7);
      for (let j = 0; j < 6; j++) {
        const stripY = 30 + j * (h * 0.7 / 6);
        ctx.fillStyle = `rgba(200, 245, 255, ${0.06 + 0.04 * Math.sin(game.time * 0.7 + j)})`;
        ctx.fillRect(baseX + 8 + Math.sin(game.time + j) * 5, stripY, 34, 8);
        ctx.fillRect(baseX + 14 + Math.cos(game.time * 0.5 + j) * 4, stripY + 12, 22, 6);
      }
    }
  }

  if (game.biome === 'lava') {
    const w = game.canvas.width;
    const h = game.canvas.height;
    for (let i = 0; i < 4; i++) {
      const px = (-parallax1 * (0.3 + i * 0.25) % 300 + i * 80) % w;
      const py = 60 + (i * 40 + Math.sin(game.time * 0.3 + i * 2) * 15) % (h * 0.4);
      ctx.fillStyle = `rgba(255, 120, 40, ${0.06 + 0.04 * Math.sin(game.time * 0.4 + i)})`;
      ctx.beginPath();
      ctx.arc(px, py, 6 + Math.sin(game.time + i) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let side = 0; side < 2; side++) {
      const baseX = side === 0 ? -parallax1 * 0.2 % 120 - 30 : w + parallax1 * 0.2 % 120 - 30;
      const grad = ctx.createLinearGradient(baseX, 0, baseX + 30, 0);
      grad.addColorStop(0, 'rgba(255, 80, 20, 0)');
      grad.addColorStop(0.5, `rgba(255, 120, 40, ${0.05 + 0.04 * Math.sin(game.time * 0.6)})`);
      grad.addColorStop(1, 'rgba(255, 80, 20, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(baseX, 30, 30, h * 0.6);
    }
  }
}
