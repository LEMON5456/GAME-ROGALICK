export const SECTOR_1 = {
  id: 'sector1',
  biome: 'space',
  name: 'Сектор 1',
  planets: [
    {
      id: 'planet1',
      name: 'Планета Alpha-7',
      width: 60,
      height: 30,
      ironCount: 10,
      crystalCount: 8,
      hazards: false,
      timeBonus: 0,
      enemies: [
        { type: 'crawler', count: 2 },
      ],
      waves: [
        { delay: 30, enemies: [{type:'crawler', count:1}, {type:'spitter', count:1}] },
      ],
    },
    {
      id: 'planet2',
      name: 'Планета Beta-3',
      width: 60,
      height: 30,
      ironCount: 8,
      crystalCount: 14,
      hazards: true,
      timeBonus: 20,
      enemies: [
        { type: 'crawler', count: 2 },
        { type: 'spitter', count: 1 },
        { type: 'kamikaze', count: 1 },
        { type: 'shield', count: 1 },
      ],
      waves: [
        { delay: 25, enemies: [{type:'crawler', count:2}] },
        { delay: 55, enemies: [{type:'spitter', count:1}, {type:'kamikaze', count:1}, {type:'shield', count:1}] },
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
      width: 60,
      height: 30,
      ironCount: 9,
      crystalCount: 11,
      hazards: true,
      timeBonus: 10,
      enemies: [
        { type: 'crawler', count: 1 },
        { type: 'spitter', count: 1 },
        { type: 'flyer', count: 1 },
      ],
      waves: [
        { delay: 30, enemies: [{type:'flyer', count:1}, {type:'crawler', count:1}] },
        { delay: 60, enemies: [{type:'kamikaze', count:1}, {type:'spitter', count:1}] },
      ],
    },
    {
      id: 'planet4',
      name: 'Глетчер-2',
      width: 60,
      height: 30,
      ironCount: 11,
      crystalCount: 15,
      hazards: true,
      timeBonus: 20,
      enemies: [
        { type: 'crawler', count: 2 },
        { type: 'spitter', count: 2 },
        { type: 'flyer', count: 1 },
        { type: 'kamikaze', count: 1 },
        { type: 'shield', count: 1 },
      ],
      waves: [
        { delay: 20, enemies: [{type:'flyer', count:1}] },
        { delay: 45, enemies: [{type:'crawler', count:2}, {type:'spitter', count:1}, {type:'shield', count:1}] },
        { delay: 70, enemies: [{type:'kamikaze', count:2}, {type:'flyer', count:1}] },
      ],
    },
    {
      id: 'planet5',
      name: 'Глетчер-3',
      width: 60,
      height: 30,
      ironCount: 14,
      crystalCount: 17,
      hazards: true,
      timeBonus: 30,
      enemies: [
        { type: 'crawler', count: 3 },
        { type: 'orc', count: 2 },
        { type: 'spitter', count: 2 },
        { type: 'flyer', count: 2 },
        { type: 'kamikaze', count: 2 },
        { type: 'teleporter', count: 1 },
      ],
      waves: [
        { delay: 15, enemies: [{type:'flyer', count:2}] },
        { delay: 40, enemies: [{type:'orc', count:1}, {type:'spitter', count:2}, {type:'crawler', count:2}, {type:'teleporter', count:1}] },
        { delay: 65, enemies: [{type:'kamikaze', count:2}, {type:'orc', count:1}, {type:'flyer', count:1}, {type:'crawler', count:2}] },
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

export const SECTOR_3 = {
  id: 'sector3',
  biome: 'lava',
  name: 'Сектор 3 — Огненные недра',
  planets: [
    {
      id: 'planet6',
      name: 'Инферно-1',
      width: 60,
      height: 30,
      ironCount: 12,
      crystalCount: 10,
      hazards: true,
      timeBonus: 15,
      enemies: [
        { type: 'spitter', count: 2 },
        { type: 'kamikaze', count: 2 },
        { type: 'shield', count: 1 },
      ],
      waves: [
        { delay: 20, enemies: [{type:'spitter', count:1}, {type:'crawler', count:2}] },
        { delay: 50, enemies: [{type:'kamikaze', count:2}, {type:'shield', count:1}] },
      ],
    },
    {
      id: 'planet7',
      name: 'Инферно-2',
      width: 60,
      height: 30,
      ironCount: 15,
      crystalCount: 12,
      hazards: true,
      timeBonus: 20,
      enemies: [
        { type: 'crawler', count: 2 },
        { type: 'spitter', count: 3 },
        { type: 'flyer', count: 2 },
        { type: 'kamikaze', count: 2 },
        { type: 'teleporter', count: 1 },
        { type: 'buffer', count: 1 },
      ],
      waves: [
        { delay: 15, enemies: [{type:'flyer', count:2}] },
        { delay: 40, enemies: [{type:'kamikaze', count:2}, {type:'spitter', count:2}, {type:'buffer', count:1}] },
      ],
    },
    {
      id: 'planet8',
      name: 'Инферно-3',
      width: 60,
      height: 30,
      ironCount: 17,
      crystalCount: 17,
      hazards: true,
      timeBonus: 25,
      enemies: [
        { type: 'crawler', count: 4 },
        { type: 'orc', count: 3 },
        { type: 'spitter', count: 3 },
        { type: 'flyer', count: 3 },
        { type: 'kamikaze', count: 3 },
        { type: 'shield', count: 2 },
        { type: 'teleporter', count: 2 },
        { type: 'buffer', count: 1 },
      ],
      waves: [
        { delay: 10, enemies: [{type:'crawler', count:3}, {type:'orc', count:1}, {type:'spitter', count:2}, {type:'shield', count:1}] },
        { delay: 30, enemies: [{type:'flyer', count:2}, {type:'kamikaze', count:2}, {type:'orc', count:1}, {type:'teleporter', count:1}] },
        { delay: 55, enemies: [{type:'orc', count:2}, {type:'spitter', count:2}, {type:'flyer', count:2}, {type:'buffer', count:1}] },
      ],
    },
  ],
};

export const ICE_BOSS_PLANET = {
  id: 'boss_ice',
  name: 'Ледяное сердце',
  biome: 'ice',
};

export const LAVA_BOSS_PLANET = {
  id: 'boss_lava',
  name: 'Сердце магмы',
  biome: 'lava',
};

export function getPlanetsForSector(sectorId) {
  if (sectorId === 'sector2') return SECTOR_2.planets;
  if (sectorId === 'sector3') return SECTOR_3.planets;
  return SECTOR_1.planets;
}

export function getSectorInfo(sectorId) {
  if (sectorId === 'sector2') return { id: 'sector2', biome: 'ice', name: SECTOR_2.name, planets: SECTOR_2.planets };
  if (sectorId === 'sector3') return { id: 'sector3', biome: 'lava', name: SECTOR_3.name, planets: SECTOR_3.planets };
  return { id: 'sector1', biome: 'space', name: SECTOR_1.name, planets: SECTOR_1.planets };
}
