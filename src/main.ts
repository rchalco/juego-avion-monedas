import { Vector2D } from './utils/Vector2D';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_LIVES,
  PROJECTILE_WIDTH,
  PROJECTILE_HEIGHT,
  PROJECTILE_SPEED,
  PROJECTILE_DAMAGE,
  PROJECTILE_POWER_DAMAGE,
  PROJECTILE_COOLDOWN,
  COIN_RADIUS,
  CoinType,
  COIN_CONFIG,
  ROCK_MIN_SIZE,
  ROCK_MAX_SIZE,
  ROCK_SPEED_LEVEL1,
  ROCK_SPEED_LEVEL2,
  ROCK_SIZE_MULTIPLIER_LEVEL2,
  LEVEL1_TARGET,
  LEVEL2_TARGET,
  POWER_PROJECTILE_COST,
  COIN_SPAWN_RATE,
  ROCK_SPAWN_RATE,
  GameState
} from './utils/Constants';

// ==================== ENTIDADES DEL JUEGO ====================

class Player {
  position: Vector2D;
  width: number = PLAYER_WIDTH;
  height: number = PLAYER_HEIGHT;
  speed: number = PLAYER_SPEED;
  lives: number = PLAYER_LIVES;
  invulnerable: boolean = false;
  invulnerableTime: number = 0;

  constructor(x: number, y: number) {
    this.position = new Vector2D(x, y);
  }

  move(dx: number, dy: number) {
    this.position.x += dx * this.speed;
    this.position.y += dy * this.speed;

    // Limitar dentro del canvas
    this.position.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.position.x));
    this.position.y = Math.max(0, Math.min(CANVAS_HEIGHT - this.height, this.position.y));
  }

  takeDamage() {
    if (!this.invulnerable) {
      this.lives--;
      this.invulnerable = true;
      this.invulnerableTime = Date.now();
    }
  }

  update() {
    // Desactivar invulnerabilidad después de 2 segundos
    if (this.invulnerable && Date.now() - this.invulnerableTime > 2000) {
      this.invulnerable = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Efecto de parpadeo cuando es invulnerable
    if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);

    // Dibujar avión
    ctx.fillStyle = '#00bfff';
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.lineTo(0, this.height / 3);
    ctx.lineTo(this.width / 2, this.height / 2);
    ctx.closePath();
    ctx.fill();

    // Alas
    ctx.fillStyle = '#0080ff';
    ctx.fillRect(-this.width / 2, 0, this.width, 5);

    ctx.restore();
  }
}

class Projectile {
  position: Vector2D;
  width: number = PROJECTILE_WIDTH;
  height: number = PROJECTILE_HEIGHT;
  speed: number = PROJECTILE_SPEED;
  damage: number;
  active: boolean = true;
  isPowered: boolean;

  constructor(x: number, y: number, isPowered: boolean = false) {
    this.position = new Vector2D(x, y);
    this.isPowered = isPowered;
    this.damage = isPowered ? PROJECTILE_POWER_DAMAGE : PROJECTILE_DAMAGE;
  }

  update() {
    this.position.y -= this.speed;
    // Desactivar si sale de la pantalla
    if (this.position.y < -this.height) {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.isPowered ? '#ff00ff' : '#ffff00';
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    // Efecto de brillo para proyectiles mejorados
    if (this.isPowered) {
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 10;
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
      ctx.shadowBlur = 0;
    }
  }
}

class Coin {
  position: Vector2D;
  radius: number = COIN_RADIUS;
  type: CoinType;
  health: number;
  maxHealth: number;
  points: number;
  color: string;
  speed: number = 1;
  active: boolean = true;
  rotation: number = 0;

  constructor(x: number, y: number, type: CoinType) {
    this.position = new Vector2D(x, y);
    this.type = type;
    const config = COIN_CONFIG[type];
    this.health = config.health;
    this.maxHealth = config.health;
    this.points = config.points;
    this.color = config.color;
  }

  takeDamage(damage: number): number {
    this.health -= damage;
    if (this.health <= 0) {
      this.active = false;
      return this.points;
    }
    return 0;
  }

  update() {
    this.position.y += this.speed;
    this.rotation += 0.05;

    // Desactivar si sale de la pantalla
    if (this.position.y > CANVAS_HEIGHT + this.radius) {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // Dibujar moneda
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Borde
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Símbolo de moneda
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);

    // Barra de salud
    ctx.restore();
    const healthPercentage = this.health / this.maxHealth;
    const barWidth = this.radius * 2;
    const barHeight = 4;
    const barX = this.position.x - this.radius;
    const barY = this.position.y - this.radius - 10;

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
  }
}

class Rock {
  position: Vector2D;
  size: number;
  speed: number;
  active: boolean = true;
  rotation: number = 0;
  rotationSpeed: number;

  constructor(x: number, y: number, level: number) {
    this.position = new Vector2D(x, y);
    const sizeMultiplier = level === 2 ? ROCK_SIZE_MULTIPLIER_LEVEL2 : 1;
    this.size = (ROCK_MIN_SIZE + Math.random() * (ROCK_MAX_SIZE - ROCK_MIN_SIZE)) * sizeMultiplier;
    this.speed = level === 1 ? ROCK_SPEED_LEVEL1 : ROCK_SPEED_LEVEL2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
  }

  update() {
    this.position.y += this.speed;
    this.rotation += this.rotationSpeed;

    // Desactivar si sale de la pantalla
    if (this.position.y > CANVAS_HEIGHT + this.size) {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // Dibujar roca (hexágono irregular)
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    const sides = 6;
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides;
      const radius = this.size / 2 + Math.random() * 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Sombra/detalle
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}

class Particle {
  position: Vector2D;
  velocity: Vector2D;
  life: number;
  maxLife: number;
  color: string;
  size: number;

  constructor(x: number, y: number, color: string) {
    this.position = new Vector2D(x, y);
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    this.velocity = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.life = 1;
    this.maxLife = 1;
    this.color = color;
    this.size = Math.random() * 4 + 2;
  }

  update(deltaTime: number) {
    this.position = this.position.add(this.velocity);
    this.life -= deltaTime * 0.02;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ==================== CLASE PRINCIPAL DEL JUEGO ====================

class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  state: GameState = GameState.MENU;
  player: Player;
  projectiles: Projectile[] = [];
  coins: Coin[] = [];
  rocks: Rock[] = [];
  particles: Particle[] = [];
  
  score: number = 0;
  level: number = 1;
  lastProjectileTime: number = 0;
  lastCoinSpawn: number = 0;
  lastRockSpawn: number = 0;
  
  keys: { [key: string]: boolean } = {};
  hasPowerProjectile: boolean = false;
  
  // Elementos del DOM
  hudElement: HTMLElement;
  scoreElement: HTMLElement;
  levelElement: HTMLElement;
  livesElement: HTMLElement;
  targetElement: HTMLElement;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    this.player = new Player(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, CANVAS_HEIGHT - 100);
    
    // Referencias a elementos del HUD
    this.hudElement = document.getElementById('hud')!;
    this.scoreElement = document.getElementById('score')!;
    this.levelElement = document.getElementById('level')!;
    this.livesElement = document.getElementById('lives')!;
    this.targetElement = document.getElementById('target')!;
    
    this.setupEventListeners();
    this.updateHUD();
    this.gameLoop();
  }

  setupEventListeners() {
    // Controles del teclado
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      
      // Disparar
      if (e.key === ' ' && this.state === GameState.PLAYING) {
        e.preventDefault();
        this.shoot();
      }
      
      // Pausa
      if ((e.key === 'Escape' || e.key.toLowerCase() === 'p') && this.state === GameState.PLAYING) {
        this.pause();
      }
      
      // Tienda (solo nivel 2)
      if (e.key.toLowerCase() === 't' && this.state === GameState.PLAYING && this.level === 2) {
        this.openShop();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
    
    // Botones del menú principal
    document.getElementById('start-btn')?.addEventListener('click', () => this.startGame());
    document.getElementById('instructions-btn')?.addEventListener('click', () => this.showInstructions());
    document.getElementById('back-btn')?.addEventListener('click', () => this.showMainMenu());
    
    // Botones de pausa
    document.getElementById('resume-btn')?.addEventListener('click', () => this.resume());
    document.getElementById('restart-btn')?.addEventListener('click', () => this.restart());
    document.getElementById('quit-btn')?.addEventListener('click', () => this.showMainMenu());
    
    // Botones de game over
    document.getElementById('retry-btn')?.addEventListener('click', () => this.restart());
    document.getElementById('menu-btn')?.addEventListener('click', () => this.showMainMenu());
    
    // Botones de victoria
    document.getElementById('play-again-btn')?.addEventListener('click', () => this.restart());
    document.getElementById('menu-btn-victory')?.addEventListener('click', () => this.showMainMenu());
    
    // Botones de tienda
    document.getElementById('buy-power-btn')?.addEventListener('click', () => this.buyPowerProjectile());
    document.getElementById('close-shop-btn')?.addEventListener('click', () => this.closeShop());
    
    // Botón de transición de nivel
    document.getElementById('continue-btn')?.addEventListener('click', () => this.continueToNextLevel());
  }

  showMainMenu() {
    this.state = GameState.MENU;
    this.hideAllMenus();
    document.getElementById('main-menu')?.classList.remove('hidden');
  }

  showInstructions() {
    this.hideAllMenus();
    document.getElementById('instructions-menu')?.classList.remove('hidden');
  }

  hideAllMenus() {
    document.querySelectorAll('.menu').forEach(menu => menu.classList.add('hidden'));
    this.hudElement.classList.add('hidden');
  }

  startGame() {
    this.hideAllMenus();
    this.state = GameState.PLAYING;
    this.hudElement.classList.remove('hidden');
    this.resetGame();
  }

  resetGame() {
    this.score = 0;
    this.level = 1;
    this.player = new Player(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, CANVAS_HEIGHT - 100);
    this.projectiles = [];
    this.coins = [];
    this.rocks = [];
    this.particles = [];
    this.hasPowerProjectile = false;
    this.lastCoinSpawn = Date.now();
    this.lastRockSpawn = Date.now();
    this.updateHUD();
  }

  pause() {
    this.state = GameState.PAUSED;
    this.hideAllMenus();
    document.getElementById('pause-menu')?.classList.remove('hidden');
  }

  resume() {
    this.state = GameState.PLAYING;
    this.hideAllMenus();
    this.hudElement.classList.remove('hidden');
  }

  restart() {
    this.startGame();
  }

  gameOver() {
    this.state = GameState.GAME_OVER;
    this.hideAllMenus();
    const finalScoreElement = document.getElementById('final-score');
    if (finalScoreElement) {
      finalScoreElement.textContent = this.score.toString();
    }
    document.getElementById('gameover-menu')?.classList.remove('hidden');
  }

  victory() {
    this.state = GameState.VICTORY;
    this.hideAllMenus();
    const victoryScoreElement = document.getElementById('victory-score');
    if (victoryScoreElement) {
      victoryScoreElement.textContent = this.score.toString();
    }
    document.getElementById('victory-menu')?.classList.remove('hidden');
  }

  levelTransition() {
    this.state = GameState.LEVEL_TRANSITION;
    this.hideAllMenus();
    const transitionMessage = document.getElementById('transition-message');
    if (transitionMessage) {
      transitionMessage.textContent = '¡Nivel 1 completado! Prepárate para más desafíos...';
    }
    document.getElementById('level-transition')?.classList.remove('hidden');
  }

  continueToNextLevel() {
    this.level = 2;
    this.coins = [];
    this.rocks = [];
    this.projectiles = [];
    this.particles = [];
    this.state = GameState.PLAYING;
    this.hideAllMenus();
    this.hudElement.classList.remove('hidden');
    this.updateHUD();
  }

  openShop() {
    this.state = GameState.SHOP;
    this.hideAllMenus();
    const shopPointsElement = document.getElementById('shop-points');
    if (shopPointsElement) {
      shopPointsElement.textContent = this.score.toString();
    }
    document.getElementById('shop-menu')?.classList.remove('hidden');
  }

  closeShop() {
    this.state = GameState.PLAYING;
    this.hideAllMenus();
    this.hudElement.classList.remove('hidden');
    const shopMessage = document.getElementById('shop-message');
    if (shopMessage) {
      shopMessage.textContent = '';
    }
  }

  buyPowerProjectile() {
    const shopMessage = document.getElementById('shop-message')!;
    if (this.score >= POWER_PROJECTILE_COST) {
      if (!this.hasPowerProjectile) {
        this.score -= POWER_PROJECTILE_COST;
        this.hasPowerProjectile = true;
        shopMessage.textContent = '¡Proyectil mejorado adquirido!';
        shopMessage.style.color = '#00ff88';
        this.updateHUD();
        const shopPointsElement = document.getElementById('shop-points');
        if (shopPointsElement) {
          shopPointsElement.textContent = this.score.toString();
        }
      } else {
        shopMessage.textContent = 'Ya tienes este poder';
        shopMessage.style.color = '#ffaa00';
      }
    } else {
      shopMessage.textContent = 'Puntos insuficientes';
      shopMessage.style.color = '#ff0000';
    }
  }

  shoot() {
    const now = Date.now();
    if (now - this.lastProjectileTime > PROJECTILE_COOLDOWN) {
      const projectileX = this.player.position.x + this.player.width / 2 - PROJECTILE_WIDTH / 2;
      const projectileY = this.player.position.y;
      this.projectiles.push(new Projectile(projectileX, projectileY, this.hasPowerProjectile));
      this.lastProjectileTime = now;
    }
  }

  spawnCoin() {
    const now = Date.now();
    if (now - this.lastCoinSpawn > COIN_SPAWN_RATE) {
      const x = Math.random() * (CANVAS_WIDTH - COIN_RADIUS * 2) + COIN_RADIUS;
      const y = -COIN_RADIUS;
      
      // Determinar tipo de moneda basado en probabilidades
      const rand = Math.random();
      let type: CoinType;
      if (rand < COIN_CONFIG[CoinType.BRONZE].spawnChance) {
        type = CoinType.BRONZE;
      } else if (rand < COIN_CONFIG[CoinType.BRONZE].spawnChance + COIN_CONFIG[CoinType.SILVER].spawnChance) {
        type = CoinType.SILVER;
      } else {
        type = CoinType.GOLD;
      }
      
      this.coins.push(new Coin(x, y, type));
      this.lastCoinSpawn = now;
    }
  }

  spawnRock() {
    const now = Date.now();
    if (now - this.lastRockSpawn > ROCK_SPAWN_RATE) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = -ROCK_MAX_SIZE;
      this.rocks.push(new Rock(x, y, this.level));
      this.lastRockSpawn = now;
    }
  }

  createExplosion(x: number, y: number, color: string) {
    for (let i = 0; i < 10; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  checkCollisions() {
    // Colisión proyectiles con monedas
    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;
      
      for (const coin of this.coins) {
        if (!coin.active) continue;
        
        const dx = projectile.position.x + projectile.width / 2 - coin.position.x;
        const dy = projectile.position.y + projectile.height / 2 - coin.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < coin.radius + projectile.width / 2) {
          projectile.active = false;
          const points = coin.takeDamage(projectile.damage);
          if (points > 0) {
            this.score += points;
            this.createExplosion(coin.position.x, coin.position.y, coin.color);
            this.updateHUD();
            
            // Verificar si se completó el objetivo del nivel
            this.checkLevelComplete();
          }
          break;
        }
      }
    }
    
    // Colisión jugador con rocas
    for (const rock of this.rocks) {
      if (!rock.active) continue;
      
      const dx = this.player.position.x + this.player.width / 2 - rock.position.x;
      const dy = this.player.position.y + this.player.height / 2 - rock.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < rock.size / 2 + this.player.width / 2) {
        rock.active = false;
        this.player.takeDamage();
        this.createExplosion(rock.position.x, rock.position.y, '#ff0000');
        this.updateHUD();
        
        if (this.player.lives <= 0) {
          this.gameOver();
        }
      }
    }
    
    // Colisión jugador con monedas (penalización)
    for (const coin of this.coins) {
      if (!coin.active) continue;
      
      const dx = this.player.position.x + this.player.width / 2 - coin.position.x;
      const dy = this.player.position.y + this.player.height / 2 - coin.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < coin.radius + this.player.width / 2) {
        coin.active = false;
        this.player.takeDamage();
        this.createExplosion(coin.position.x, coin.position.y, '#ff0000');
        this.updateHUD();
        
        if (this.player.lives <= 0) {
          this.gameOver();
        }
      }
    }
  }

  checkLevelComplete() {
    const target = this.level === 1 ? LEVEL1_TARGET : LEVEL2_TARGET;
    if (this.score >= target) {
      if (this.level === 1) {
        this.levelTransition();
      } else {
        this.victory();
      }
    }
  }

  updateHUD() {
    this.scoreElement.textContent = this.score.toString();
    this.levelElement.textContent = this.level.toString();
    this.livesElement.textContent = this.player.lives.toString();
    const target = this.level === 1 ? LEVEL1_TARGET : LEVEL2_TARGET;
    this.targetElement.textContent = target.toString();
  }

  update() {
    if (this.state !== GameState.PLAYING) return;
    
    // Actualizar jugador
    let dx = 0;
    let dy = 0;
    
    if (this.keys['w'] || this.keys['arrowup']) dy = -1;
    if (this.keys['s'] || this.keys['arrowdown']) dy = 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx = -1;
    if (this.keys['d'] || this.keys['arrowright']) dx = 1;
    
    if (dx !== 0 || dy !== 0) {
      this.player.move(dx, dy);
    }
    
    this.player.update();
    
    // Spawn de entidades
    this.spawnCoin();
    this.spawnRock();
    
    // Actualizar proyectiles
    this.projectiles = this.projectiles.filter(p => p.active);
    this.projectiles.forEach(p => p.update());
    
    // Actualizar monedas
    this.coins = this.coins.filter(c => c.active);
    this.coins.forEach(c => c.update());
    
    // Actualizar rocas
    this.rocks = this.rocks.filter(r => r.active);
    this.rocks.forEach(r => r.update());
    
    // Actualizar partículas
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => p.update(1));
    
    // Colisiones
    this.checkCollisions();
  }

  draw() {
    // Limpiar canvas
    this.ctx.fillStyle = 'rgba(0, 4, 40, 0.3)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Dibujar estrellas de fondo (efecto simple)
    if (this.state === GameState.PLAYING) {
      this.ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 50; i++) {
        const x = (i * 123) % CANVAS_WIDTH;
        const y = ((Date.now() * 0.05 + i * 456) % CANVAS_HEIGHT);
        this.ctx.fillRect(x, y, 2, 2);
      }
    }
    
    if (this.state !== GameState.PLAYING) return;
    
    // Dibujar partículas
    this.particles.forEach(p => p.draw(this.ctx));
    
    // Dibujar monedas
    this.coins.forEach(c => c.draw(this.ctx));
    
    // Dibujar rocas
    this.rocks.forEach(r => r.draw(this.ctx));
    
    // Dibujar proyectiles
    this.projectiles.forEach(p => p.draw(this.ctx));
    
    // Dibujar jugador
    this.player.draw(this.ctx);
  }

  gameLoop = () => {
    this.update();
    this.draw();
    requestAnimationFrame(this.gameLoop);
  }
}

// Iniciar el juego cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
