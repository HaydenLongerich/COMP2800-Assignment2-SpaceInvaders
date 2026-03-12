function loadAsset(path) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = path;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
  });
}

function createEnemies(enemyImg, canvas) {
  const enemies = [];
  const rows = 5;
  const cols = 5;
  const enemyWidth = 60;
  const enemyHeight = 60;
  const gapX = 20;
  const gapY = 20;

  const totalWidth = cols * enemyWidth + (cols - 1) * gapX;
  const startX = (canvas.width - totalWidth) / 2;
  const startY = 60;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      enemies.push({
        img: enemyImg,
        x: startX + col * (enemyWidth + gapX),
        y: startY + row * (enemyHeight + gapY),
        width: enemyWidth,
        height: enemyHeight,
      });
    }
  }

  return enemies;
}

async function drawGame() {
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  try {
    const heroImg = await loadAsset("./assets/player.png");
    const enemyImg = await loadAsset("./assets/enemyShip.png");

    const heroWidth = 90;
    const heroHeight = 90;
    const heroX = canvas.width / 2 - 45;
    const heroY = canvas.height - canvas.height / 4;

    ctx.drawImage(heroImg, heroX, heroY, heroWidth, heroHeight);

    const enemies = createEnemies(enemyImg, canvas);
    enemies.forEach(enemy => {
      ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
    });
  } catch (error) {
    console.error(error);
  }
}

window.onload = drawGame;