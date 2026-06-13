import { TILE_SIZE } from '../constants.js';

export function aabbOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function moveWithCollisions(entity, map, dt) {
  entity.x += entity.vx * dt;
  resolveAxis(entity, map, 'x');
  entity.y += entity.vy * dt;
  resolveAxis(entity, map, 'y');
}

export function overlapsSolid(entity, map) {
  const left = Math.floor(entity.x / TILE_SIZE);
  const right = Math.floor((entity.x + entity.w - 0.01) / TILE_SIZE);
  const top = Math.floor(entity.y / TILE_SIZE);
  const bottom = Math.floor((entity.y + entity.h - 0.01) / TILE_SIZE);

  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      if (map.isSolid(map.get(tx, ty))) return true;
    }
  }
  return false;
}

export function placeEntitySafely(entity, map, x, y) {
  entity.x = x;
  entity.y = y;
  entity.vx = 0;
  entity.vy = 0;

  for (let i = 0; i < 40; i++) {
    if (!overlapsSolid(entity, map)) {
      entity.grounded = isOnGround(entity, map);
      return;
    }
    entity.y -= TILE_SIZE / 2;
  }

  for (let tx = 2; tx < map.width - 2; tx++) {
    for (let ty = 2; ty < map.height - 2; ty++) {
      if (map.isSolid(map.get(tx, ty)) || !map.isSolid(map.get(tx, ty + 1))) continue;
      entity.x = tx * TILE_SIZE;
      entity.y = (ty + 1) * TILE_SIZE - entity.h;
      if (!overlapsSolid(entity, map)) {
        entity.grounded = true;
        return;
      }
    }
  }
}

export function isOnGround(entity, map) {
  const footY = entity.y + entity.h + 1;
  const left = Math.floor(entity.x / TILE_SIZE);
  const right = Math.floor((entity.x + entity.w - 0.01) / TILE_SIZE);
  const ty = Math.floor(footY / TILE_SIZE);

  for (let tx = left; tx <= right; tx++) {
    if (map.isSolid(map.get(tx, ty))) return true;
  }
  return false;
}

function resolveAxis(entity, map, axis) {
  const left = Math.floor(entity.x / TILE_SIZE);
  const right = Math.floor((entity.x + entity.w - 0.01) / TILE_SIZE);
  const top = Math.floor(entity.y / TILE_SIZE);
  const bottom = Math.floor((entity.y + entity.h - 0.01) / TILE_SIZE);

  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      if (!map.isSolid(map.get(tx, ty))) continue;
      const tileX = tx * TILE_SIZE;
      const tileY = ty * TILE_SIZE;

      if (axis === 'x') {
        if (entity.vx > 0) entity.x = tileX - entity.w;
        else if (entity.vx < 0) entity.x = tileX + TILE_SIZE;
        entity.vx = 0;
      } else {
        if (entity.vy > 0) {
          entity.y = tileY - entity.h;
          entity.grounded = true;
        } else if (entity.vy < 0) {
          entity.y = tileY + TILE_SIZE;
        }
        entity.vy = 0;
      }
    }
  }
}

export function getGroundY(map, x, startY) {
  const tx = Math.floor(x / TILE_SIZE);
  let ty = Math.floor(startY / TILE_SIZE);
  while (ty < map.height) {
    if (map.isSolid(map.get(tx, ty))) return ty * TILE_SIZE;
    ty++;
  }
  return map.height * TILE_SIZE;
}

export function dist(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function center(entity) {
  return { x: entity.x + entity.w / 2, y: entity.y + entity.h / 2 };
}
