export const TILE = {
  AIR: 0,
  STONE: 1,
  ORE_IRON: 2,
  ORE_CRYSTAL: 3,
  HAZARD: 4,
  EXIT_PAD: 5,
};

export const TILE_SIZE = 32;

export const COLORS = {
  sky1: '#0d1025',
  sky2: '#1a2040',
  stone: '#3a3a4a',
  stoneDark: '#2a2a38',
  iron: '#c87020',
  crystal: '#40c8e8',
  hazard: '#8040a0',
  player: '#4080ff',
  playerHelmet: '#60a0ff',
  crawler: '#e04040',
  spitter: '#a040e0',
  boss: '#40c060',
  projectile: '#ffee60',
  enemyProjectile: '#ff6060',
  exit: '#60ff80',
  exitPad: '#30cc60',
  exitGlow: '#80ffaa',
  spawn: '#8080ff',
};

export const PHYSICS = {
  GRAVITY: 1800,
  PLAYER_SPEED: 220,
  PLAYER_JUMP: -560,
  MAX_FALL: 600,
};

export const COMBAT = {
  PLAYER_DAMAGE: 10,
  PLAYER_FIRE_RATE: 0.4,
  PROJECTILE_SPEED: 480,
  CRAWLER_HP: 30,
  CRAWLER_DAMAGE: 15,
  CRAWLER_SPEED: 80,
  SPITTER_HP: 40,
  SPITTER_DAMAGE: 10,
  SPITTER_FIRE_RATE: 2,
  BOSS_HP: 300,
  BOSS_DAMAGE: 20,
  INVINCIBLE_TIME: 0.8,
};

export const MINING = {
  BASE_TIME: 1.0,
  RANGE: 96,
};

export const PLAYER = {
  REGEN_INTERVAL: 5,
  REGEN_DELAY: 2,
  ULTIMATE_CHARGE: 100,
  FRICTION: 0.85,
  ICE_FRICTION: 0.85,
};

export const SPAWN = {
  ELITE_CHANCE: 0.15,
  PICKUP_DROP_CHANCE: 0.2,
  VAMPIRE_HEAL: 15,
  HOMING_RADIUS: 300,
  HOMING_STEER: 0.15,
  PROJECTILE_LIMIT: 80,
  EVENT_CHANCE: 0.4,
};

export const PLANET_TIMER = 210;

export const TUNNEL = {
  CAVE_TOP: 4,
  CAVE_BOTTOM: 19,
  FLOOR_TY: 20,
  CEILING_TY: 3,
};
