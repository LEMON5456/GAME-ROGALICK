export const BIOMES = {
  space: {
    id: 'space',
    name: 'Сектор 1 — Космические шахты',
    sky1: '#0d1025',
    sky2: '#1a2040',
    stone: '#3a3a4a',
    stoneDark: '#2a2a38',
    accent: '#446',
    parallaxColor1: 'rgba(60, 80, 120, 0.3)',
    parallaxColor2: 'rgba(40, 60, 100, 0.2)',
    hazardGlow: 'rgba(128, 64, 160, 0.35)',
    tileSprite: null,
    hazardSprite: null,
    musicType: 'space',
    enemyTint: null,
  },
  ice: {
    id: 'ice',
    name: 'Сектор 2 — Ледяные глубины',
    sky1: '#0a1525',
    sky2: '#1a2a45',
    stone: '#4a5a6a',
    stoneDark: '#3a4a5a',
    accent: '#5a7a9a',
    parallaxColor1: 'rgba(100, 160, 220, 0.2)',
    parallaxColor2: 'rgba(70, 120, 180, 0.15)',
    hazardGlow: 'rgba(120, 200, 255, 0.3)',
    tileSprite: null,
    hazardSprite: null,
    musicType: 'ice',
    enemyTint: '#8af',
  },
};

export function getBiome(id) {
  return BIOMES[id] || BIOMES.space;
}
