import { COMBAT, COLORS } from '../constants.js';
import { sprites, SPRITES } from '../core/Sprites.js';
import { effectSheets } from '../core/EffectSheets.js';

const BIOME_SHEET = { space: 'purple', ice: 'water', lava: 'fire' };

let arrowImg = null;
export function loadArrowSprite() {
  arrowImg = new Image();
  arrowImg.src = 'assets/sprites/arrow/Arrow01(32x32).png';
}

export function renderProjectile(ctx, p) {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  const sprite = p.owner === 'player' ? SPRITES.projectile : SPRITES.enemyProjectile;
  const size = 12;
  if (sprites.drawIcon(ctx, sprite, cx - size / 2, cy - size / 2, size)) return;
  if (p.owner === 'player' && arrowImg && arrowImg.complete && arrowImg.naturalWidth > 0) {
    ctx.save();
    ctx.translate(cx, cy);
    if (p.vx < 0) { ctx.scale(-1, 1); }
    ctx.drawImage(arrowImg, 7, 13, 19, 7, -9, -4, 18, 7);
    ctx.restore();
    return;
  }
  if (p._animFrame === undefined) {
    p._animFrame = Math.floor(Math.random() * 8);
  }
  const sheetName = p.owner === 'player' ? (BIOME_SHEET[p.biome] || 'purple') : 'fire';
  const frame = p._animFrame + (p.owner === 'player' ? 0 : 40);
  if (effectSheets.drawFrame(ctx, sheetName, frame, cx - size / 2, cy - size / 2, size, size)) return;
  ctx.fillStyle = p.owner === 'player' ? COLORS.projectile : COLORS.enemyProjectile;
  ctx.fillRect(p.x, p.y, p.w, p.h);
}

export function getProjectileDamage(owner, run) {
  if (owner === 'player') {
    return COMBAT.PLAYER_DAMAGE * (run?.damageMult || 1);
  }
  if (owner === 'spitter' || owner === 'flyer' || owner === 'orc') return COMBAT.SPITTER_DAMAGE;
  if (owner === 'boss') return COMBAT.BOSS_DAMAGE;
  return 10;
}
