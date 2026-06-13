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
    sky1: '#0a1a2e',
    sky2: '#1c304a',
    stone: '#4a6880',
    stoneDark: '#355066',
    accent: '#7ab8d4',
    parallaxColor1: 'rgba(140, 210, 255, 0.25)',
    parallaxColor2: 'rgba(90, 160, 220, 0.18)',
    hazardGlow: 'rgba(160, 230, 255, 0.45)',
    tileSprite: null,
    hazardSprite: null,
    musicType: 'ice',
    enemyTint: '#8af',
  },
};

export function getBiome(id) {
  return BIOMES[id] || BIOMES.space;
}
