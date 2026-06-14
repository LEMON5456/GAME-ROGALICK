import { COMBAT, COLORS } from '../constants.js';
import { sprites, SPRITES } from '../core/Sprites.js';
import { effectSheets } from '../core/EffectSheets.js';

const BIOME_SHEET = { space: 'purple', ice: 'water', lava: 'fire' };

export function renderProjectile(ctx, p) {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  const sprite = p.owner === 'player' ? SPRITES.projectile : SPRITES.enemyProjectile;
  const size = 12;
  if (sprites.drawIcon(ctx, sprite, cx - size / 2, cy - size / 2, size)) return;
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
  if (owner === 'spitter' || owner === 'flyer') return COMBAT.SPITTER_DAMAGE;
  if (owner === 'boss') return COMBAT.BOSS_DAMAGE;
  return 10;
}
