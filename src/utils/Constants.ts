// Constantes del juego
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Jugador
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 30;
export const PLAYER_SPEED = 5;
export const PLAYER_LIVES = 3;

// Proyectiles
export const PROJECTILE_WIDTH = 5;
export const PROJECTILE_HEIGHT = 15;
export const PROJECTILE_SPEED = 8;
export const PROJECTILE_DAMAGE = 1;
export const PROJECTILE_POWER_DAMAGE = 2;
export const PROJECTILE_COOLDOWN = 250; // ms

// Monedas
export const COIN_RADIUS = 20;

export enum CoinType {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold'
}

export const COIN_CONFIG = {
  [CoinType.BRONZE]: {
    health: 8,
    points: 15,
    color: '#CD7F32',
    spawnChance: 0.5
  },
  [CoinType.SILVER]: {
    health: 12,
    points: 40,
    color: '#C0C0C0',
    spawnChance: 0.3
  },
  [CoinType.GOLD]: {
    health: 25,
    points: 100,
    color: '#FFD700',
    spawnChance: 0.2
  }
};

// Rocas
export const ROCK_MIN_SIZE = 30;
export const ROCK_MAX_SIZE = 50;
export const ROCK_SPEED_LEVEL1 = 2;
export const ROCK_SPEED_LEVEL2 = 3;
export const ROCK_SIZE_MULTIPLIER_LEVEL2 = 1.5;

// Niveles
export const LEVEL1_TARGET = 800;
export const LEVEL2_TARGET = 5000;

// Tienda
export const POWER_PROJECTILE_COST = 50;

// Spawn rates (milisegundos)
export const COIN_SPAWN_RATE = 2000;
export const ROCK_SPAWN_RATE = 1500;

// Estados del juego
export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'gameOver',
  VICTORY = 'victory',
  LEVEL_TRANSITION = 'levelTransition',
  SHOP = 'shop'
}