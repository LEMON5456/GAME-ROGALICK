export const SECTOR_1 = {
  id: 'sector1',
  biome: 'space',
  name: 'Сектор 1',
  planets: [
    {
      id: 'planet1',
      name: 'Планета Alpha-7',
      ironCount: 20,
      crystalCount: 18,
      hazards: false,
      timeBonus: 0,
      enemies: [
        { type: 'crawler', count: 2 },
      ],
    },
    {
      id: 'planet2',
      name: 'Планета Beta-3',
      ironCount: 15,
      crystalCount: 28,
      hazards: true,
      timeBonus: 20,
      enemies: [
        { type: 'crawler', count: 2 },
        { type: 'spitter', count: 1 },
        { type: 'kamikaze', count: 1 },
      ],
    },
  ],
};

export const SECTOR_2 = {
  id: 'sector2',
  biome: 'ice',
  name: 'Сектор 2 — Ледяные глубины',
  planets: [
    {
      id: 'planet3',
      name: 'Глетчер-1',
      ironCount: 18,
      crystalCount: 22,
      hazards: true,
      timeBonus: 10,
      enemies: [
        { type: 'crawler', count: 1 },
        { type: 'spitter', count: 1 },
        { type: 'flyer', count: 1 },
      ],
    },
    {
      id: 'planet4',
      name: 'Глетчер-2',
      ironCount: 22,
      crystalCount: 30,
      hazards: true,
      timeBonus: 20,
      enemies: [
        { type: 'crawler', count: 2 },
        { type: 'spitter', count: 2 },
        { type: 'flyer', count: 1 },
        { type: 'kamikaze', count: 1 },
      ],
    },
    {
      id: 'planet5',
      name: 'Глетчер-3',
      ironCount: 28,
      crystalCount: 35,
      hazards: true,
      timeBonus: 30,
      enemies: [
        { type: 'crawler', count: 3 },
        { type: 'spitter', count: 2 },
        { type: 'flyer', count: 2 },
        { type: 'kamikaze', count: 2 },
      ],
    },
  ],
};

export const PLANETS = SECTOR_1.planets;

export const BOSS_PLANET = {
  id: 'boss',
  name: 'Ядро разлома',
  biome: 'space',
};

export function getPlanetsForSector(sectorId) {
  if (sectorId === 'sector2') return SECTOR_2.planets;
  return SECTOR_1.planets;
}

export function getSectorInfo(sectorId) {
  if (sectorId === 'sector2') return { id: 'sector2', biome: 'ice', name: SECTOR_2.name, planets: SECTOR_2.planets };
  return { id: 'sector1', biome: 'space', name: SECTOR_1.name, planets: SECTOR_1.planets };
}
