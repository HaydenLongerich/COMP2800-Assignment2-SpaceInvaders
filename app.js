const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_SPACE = 32;

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

let playerImg;
let enemyImg;
let laserImg;

let hero;
let gameObjects = [];
let lastFireTime = 0;
const FIRE_COOLDOWN = 400;

class GameObject {
  constructor(x, y, width, height, img, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.img = img;
    this.type = type;
    this.dead = false;
  }

  draw() {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  rectFromGameObject() {
    return {
      top: this.y,
      left: this.x,
      bottom: this.y + this.height,
      right: this.x + this.width
    };
  }
}

class Hero extends GameObject {
  constructor(x, y, img) {
    super(x, y, 90, 90, img, "Hero");
    this.speed = 12;
  }

  moveLeft() {
    this.x -= this.speed;
    if (this.x < 0) this.x = 0;
  }

  moveRight() {
    this.x += this.speed;
    if (this.x > GAME_WIDTH - this.width) {
      this.x = GAME_WIDTH - this.width;
    }
  }

  moveUp() {
    this.y -= this.speed;
    if (this.y < 0) this.y = 0;
  }

  moveDown() {
    this.y += this.speed;
    if (this.y > GAME_HEIGHT - this.height) {
      this.y = GAME_HEIGHT - this.height;
    }
  }

  canFire() {
    return Date.now() - lastFireTime >= FIRE_COOLDOWN;
  }

  fire() {
    if (!this.canFire()) return;

    const laserX = this.x + this.width / 2 - 4.5;
    const laserY = this.y - 20;

    const laser = new Laser(laserX, laserY, laserImg);
    gameObjects.push(laser);
    lastFireTime = Date.now();
  }
}

class Enemy extends GameObject {
  constructor(x, y, img) {
    super(x, y, 60, 60, img, "Enemy");
    this.speed = 0.35;
    this.direction = 1;
  }

  update() {
    this.x += this.speed * this.direction;

    if (this.x <= 0) {
      this.x = 0;
      this.direction = 1;
      this.y += 18;
    }

    if (this.x >= GAME_WIDTH - this.width) {
      this.x = GAME_WIDTH - this.width;
      this.direction = -1;
      this.y += 18;
    }
  }
}

class Laser extends GameObject {
  constructor(x, y, img) {
    super(x, y, 9, 33, img, "Laser");
    this.speed = 15;
  }

  update() {
    this.y -= this.speed;

    if (this.y + this.height < 0) {
      this.dead = true;
    }
  }
}

function loadAsset(path) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = path;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
  });
}

function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

function createEnemyWave() {
  const enemies = [];
  const rows = 5;
  const cols = 5;
  const enemyWidth = 60;
  const enemyHeight = 60;
  const gapX = 20;
  const gapY = 20;

  const totalWidth = cols * enemyWidth + (cols - 1) * gapX;
  const startX = (GAME_WIDTH - totalWidth) / 2;
  const startY = 60;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * (enemyWidth + gapX);
      const y = startY + row * (enemyHeight + gapY);
      enemies.push(new Enemy(x, y, enemyImg));
    }
  }

  return enemies;
}

function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function drawGame() {
  drawBackground();

  gameObjects.forEach(obj => {
    if (!obj.dead) {
      obj.draw();
    }
  });
}

function updateGameObjects() {
  gameObjects.forEach(obj => {
    if (!obj.dead && typeof obj.update === "function") {
      obj.update();
    }
  });

  const enemies = gameObjects.filter(obj => obj.type === "Enemy" && !obj.dead);
  const lasers = gameObjects.filter(obj => obj.type === "Laser" && !obj.dead);

  lasers.forEach(laser => {
    enemies.forEach(enemy => {
      if (intersectRect(laser.rectFromGameObject(), enemy.rectFromGameObject())) {
        laser.dead = true;
        enemy.dead = true;
      }
    });
  });

  if (!hero.dead) {
    enemies.forEach(enemy => {
      if (intersectRect(hero.rectFromGameObject(), enemy.rectFromGameObject())) {
        hero.dead = true;
        enemy.dead = true;
      }
    });
  }

  gameObjects = gameObjects.filter(obj => !obj.dead);
}

function gameLoop() {
  updateGameObjects();
  drawGame();
}

function onKeyDown(e) {
  if (
    e.keyCode === KEY_LEFT ||
    e.keyCode === KEY_RIGHT ||
    e.keyCode === KEY_UP ||
    e.keyCode === KEY_DOWN ||
    e.keyCode === KEY_SPACE
  ) {
    e.preventDefault();
  }

  if (!hero || hero.dead) return;

  switch (e.keyCode) {
    case KEY_LEFT:
      hero.moveLeft();
      break;
    case KEY_RIGHT:
      hero.moveRight();
      break;
    case KEY_UP:
      hero.moveUp();
      break;
    case KEY_DOWN:
      hero.moveDown();
      break;
    case KEY_SPACE:
      hero.fire();
      break;
    default:
      break;
  }
}

async function startGame() {
  try {
    playerImg = await loadAsset("./assets/player.png");
    enemyImg = await loadAsset("./assets/enemyShip.png");
    laserImg = await loadAsset("./assets/laserRed.png");

    hero = new Hero(GAME_WIDTH / 2 - 45, GAME_HEIGHT - 150, playerImg);

    gameObjects = [hero, ...createEnemyWave()];

    window.addEventListener("keydown", onKeyDown);

    setInterval(gameLoop, 1000 / 60);
  } catch (error) {
    console.error(error);
  }
}

window.onload = startGame;