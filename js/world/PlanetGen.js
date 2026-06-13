import { TILE, TILE_SIZE } from '../constants.js';
import { TileMap } from './TileMap.js';

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

const FLOOR_TY = 12;
const CAVE_TOP = 8;
const CAVE_BOTTOM = 11;
const CEILING_TY = 7;

export function generatePlanet(config, biome = 'space') {
  const { width = 120, height = 40, ironCount = 4, crystalCount = 1, hazards = false } = config;
  const map = new TileMap(width, height, biome);

  fillStone(map, width, height);
  carveMainTunnel(map, width);
  carveSpawnRoom(map);
  carveExitZone(map, width);
  placeJumpableStumps(map, width);

  if (hazards) {
    placeHazards(map, width);
  }

  guaranteeJumpLane(map, width);
  placeOres(map, TILE.ORE_IRON, ironCount);
  placeOres(map, TILE.ORE_CRYSTAL, crystalCount);
  placeSpawnOres(map);
  removeFloatingBlocks(map, width, height);

  return map;
}

function fillStone(map, width, height) {
  for (let ty = 0; ty < height; ty++) {
    for (let tx = 0; tx < width; tx++) {
      map.set(tx, ty, TILE.STONE);
    }
  }
}

function carveMainTunnel(map, width) {
  for (let tx = 2; tx < width - 2; tx++) {
    for (let ty = CAVE_TOP; ty <= CAVE_BOTTOM; ty++) {
      map.set(tx, ty, TILE.AIR);
    }
    map.set(tx, FLOOR_TY, TILE.STONE);
  }

  for (let tx = 2; tx < width - 2; tx++) {
    map.set(tx, CEILING_TY, TILE.STONE);
  }
}

function carveSpawnRoom(map) {
  for (let tx = 3; tx <= 12; tx++) {
    for (let ty = CAVE_TOP; ty <= CAVE_BOTTOM; ty++) {
      map.set(tx, ty, TILE.AIR);
    }
    map.set(tx, FLOOR_TY, TILE.STONE);
  }

  map.spawnX = 5 * TILE_SIZE;
  map.spawnY = FLOOR_TY * TILE_SIZE - 36;
}

function placeSpawnOres(map) {
  for (let tx = 15; tx <= 19; tx++) {
    if (map.get(tx, FLOOR_TY) === TILE.STONE) {
      map.set(tx, FLOOR_TY, TILE.ORE_IRON);
    }
  }
  map.set(20, FLOOR_TY, TILE.ORE_CRYSTAL);
  map.set(21, FLOOR_TY, TILE.ORE_CRYSTAL);
}

function carveExitZone(map, width) {
  const startTx = width - 14;
  const exitCenterTx = width - 6;

  for (let tx = startTx; tx <= width - 3; tx++) {
    for (let ty = CAVE_TOP; ty <= CAVE_BOTTOM; ty++) {
      map.set(tx, ty, TILE.AIR);
    }
  }

  for (let tx = exitCenterTx - 1; tx <= exitCenterTx + 1; tx++) {
    map.set(tx, FLOOR_TY, TILE.EXIT_PAD);
    for (let ty = CAVE_TOP; ty <= CAVE_BOTTOM - 1; ty++) {
      map.set(tx, ty, TILE.AIR);
    }
    map.set(tx, CEILING_TY, TILE.STONE);
  }

  map.set(exitCenterTx - 2, CEILING_TY, TILE.STONE);
  map.set(exitCenterTx + 2, CEILING_TY, TILE.STONE);
  map.set(exitCenterTx - 2, FLOOR_TY, TILE.STONE);
  map.set(exitCenterTx + 2, FLOOR_TY, TILE.STONE);

  map.exitX = exitCenterTx * TILE_SIZE + TILE_SIZE / 2;
  map.exitY = FLOOR_TY * TILE_SIZE;
  map.exitTx = exitCenterTx;
}

function placeJumpableStumps(map, width) {
  const reserved = new Set();
  for (let tx = 3; tx <= 16; tx++) reserved.add(tx);
  for (let tx = width - 18; tx <= width - 3; tx++) reserved.add(tx);

  let tx = 22;
  while (tx < width - 22) {
    tx += randInt(22, 35);
    if (tx >= width - 22 || reserved.has(tx)) continue;

    map.set(tx, CAVE_BOTTOM, TILE.STONE);
    tx += 3;
  }
}

function guaranteeJumpLane(map, width) {
  for (let tx = 2; tx < width - 2; tx++) {
    for (let ty = CAVE_TOP; ty <= CAVE_BOTTOM - 1; ty++) {
      const tile = map.get(tx, ty);
      if (tile === TILE.STONE || tile === TILE.ORE_IRON || tile === TILE.ORE_CRYSTAL || tile === TILE.HAZARD) {
        map.set(tx, ty, TILE.AIR);
      }
    }
  }
}

function placeOres(map, oreTile, count) {
  let placed = 0;
  const step = Math.max(4, Math.floor((map.width - 40) / Math.max(count, 1)));
  let tx = 18;

  while (placed < count && tx < map.width - 18) {
    const veinLen = randInt(1, 3);
    for (let i = 0; i < veinLen && placed < count; i++) {
      const spot = tx + i;
      if (map.get(spot, FLOOR_TY) !== TILE.STONE) continue;
      if (map.get(spot, FLOOR_TY) === TILE.EXIT_PAD) continue;
      if (map.get(spot, FLOOR_TY) === TILE.HAZARD) continue;
      map.set(spot, FLOOR_TY, oreTile);
      placed++;
    }
    tx += step + randInt(0, 4);
  }

  let attempts = 0;
  while (placed < count && attempts < 500) {
    attempts++;
    const spot = randInt(18, map.width - 18);
    if (map.get(spot, FLOOR_TY) !== TILE.STONE) continue;
    map.set(spot, FLOOR_TY, oreTile);
    placed++;
  }
}

function placeHazards(map, width) {
  let placed = 0;
  let attempts = 0;
  const count = map.biome === 'ice' ? 6 : 4;
  while (placed < count && attempts < 100) {
    attempts++;
    const tx = randInt(18, width - 18);
    if (map.get(tx, FLOOR_TY) !== TILE.STONE) continue;
    if (map.get(tx, CAVE_TOP) !== TILE.AIR) continue;
    map.set(tx, FLOOR_TY, TILE.HAZARD);
    placed++;
  }
}

function removeFloatingBlocks(map, width, height) {
  for (let pass = 0; pass < 3; pass++) {
    for (let ty = 1; ty < height - 1; ty++) {
      for (let tx = 2; tx < width - 2; tx++) {
        const tile = map.get(tx, ty);
        if (tile !== TILE.STONE) continue;
        if (ty === FLOOR_TY || ty === CEILING_TY) continue;
        if (ty === 0 || ty === height - 1) continue;

        const airL = map.get(tx - 1, ty) === TILE.AIR;
        const airR = map.get(tx + 1, ty) === TILE.AIR;
        const airU = map.get(tx, ty - 1) === TILE.AIR;
        const airD = map.get(tx, ty + 1) === TILE.AIR;

        if (airL && airR && airU && airD) {
          map.set(tx, ty, TILE.AIR);
        }
      }
    }
  }
}

export function generateBossArena() {
  const width = 60;
  const height = 30;
  const map = new TileMap(width, height);

  for (let ty = 0; ty < height; ty++) {
    for (let tx = 0; tx < width; tx++) {
      if (ty >= 22) map.set(tx, ty, TILE.STONE);
      else map.set(tx, ty, TILE.AIR);
    }
  }

  for (let tx = 0; tx < width; tx++) {
    map.set(tx, 0, TILE.STONE);
    map.set(tx, height - 1, TILE.STONE);
  }
  for (let ty = 0; ty < height; ty++) {
    map.set(0, ty, TILE.STONE);
    map.set(width - 1, ty, TILE.STONE);
  }

  map.spawnX = 4 * TILE_SIZE;
  map.spawnY = 22 * TILE_SIZE - 36;
  map.exitX = 0;
  map.exitY = 0;

  return map;
}

export function findEnemySpawns(map, count) {
  const spawns = [];
  let attempts = 0;

  while (spawns.length < count && attempts < 400) {
    attempts++;
    const tx = randInt(18, map.width - 18);
    if (map.get(tx, CAVE_BOTTOM) !== TILE.AIR) continue;
    if (map.get(tx, FLOOR_TY) === TILE.AIR || map.get(tx, FLOOR_TY) === TILE.EXIT_PAD) continue;
    if (map.get(tx, FLOOR_TY) === TILE.HAZARD) continue;

    const pos = { x: tx * TILE_SIZE, y: FLOOR_TY * TILE_SIZE - 24 };
    if (spawns.some((s) => Math.abs(s.x - pos.x) < 100)) continue;
    spawns.push(pos);
  }

  return spawns;
}
