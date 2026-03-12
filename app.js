const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

let heroImg;
let enemyImg;

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
}

class Hero extends GameObject {
  constructor(x, y, img) {
    super(x, y, 90, 90, img, "Hero");
    this.speed = 12;
  }

  moveLeft() {
    this.x -= this.speed;
    if (this.x < 0) {
      this.x = 0;
    }
  }

  moveRight() {
    this.x += this.speed;
    if (this.x > GAME_WIDTH - this.width) {
      this.x = GAME_WIDTH - this.width;
    }
  }

  moveUp() {
    this.y -= this.speed;
    if (this.y < 0) {
      this.y = 0;
    }
  }

  moveDown() {
    this.y += this.speed;
    if (this.y > GAME_HEIGHT - this.height) {
      this.y = GAME_HEIGHT - this.height;
    }
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

function loadAsset(path) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = path;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
  });
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

let hero;
let enemies = [];

function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function drawGame() {
  drawBackground();
  hero.draw();

  enemies.forEach(enemy => {
    enemy.draw();
  });
}

function updateGame() {
  enemies.forEach(enemy => {
    enemy.update();
  });
}

function gameLoop() {
  updateGame();
  drawGame();
}

function onKeyDown(e) {
  switch (e.keyCode) {
    case KEY_LEFT:
    case KEY_RIGHT:
    case KEY_UP:
    case KEY_DOWN:
    case 32:
      e.preventDefault();
      break;
    default:
      break;
  }

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
    default:
      break;
  }
}

async function startGame() {
  try {
    heroImg = await loadAsset("./assets/player.png");
    enemyImg = await loadAsset("./assets/enemyShip.png");

    hero = new Hero(GAME_WIDTH / 2 - 45, GAME_HEIGHT - 150, heroImg);
    enemies = createEnemyWave();

    window.addEventListener("keydown", onKeyDown);

    setInterval(gameLoop, 1000 / 60);
  } catch (error) {
    console.error(error);
  }
}

window.onload = startGame;