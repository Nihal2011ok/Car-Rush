const car = document.getElementById('car');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score-value');
const levelElement = document.getElementById('level-value');
const livesElement = document.getElementById('lives-value');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const highScoreElement = document.getElementById('high-score');
const restartButton = document.getElementById('restart-button');
const powerUp = document.getElementById('power-up');

let carPosition = 125;
let score = 0;
let level = 1;
let lives = 3;
let gameInterval;
let obstacleInterval;
let powerUpInterval;
let speed = 5;
let obstacleCreationTime = 1500;
let obstacleTypes = ['obstacle', 'obstacle-wide', 'obstacle-fast'];
let isInvincible = false;
let highScore = localStorage.getItem('highScore') || 0;

document.addEventListener('keydown', moveCar);
restartButton.addEventListener('click', startGame);

function moveCar(e) {
    if (e.key === 'ArrowLeft' && carPosition > 0) {
        carPosition -= 10;
    } else if (e.key === 'ArrowRight' && carPosition < 250) {
        carPosition += 10;
    }
    car.style.left = carPosition + 'px';
}

function createObstacle() {
    const obstacle = document.createElement('div');
    const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    obstacle.classList.add(randomType);
    obstacle.style.left = Math.floor(Math.random() * 250) + 'px';
    gameContainer.appendChild(obstacle);

    let obstaclePosition = -50;
    const moveObstacle = setInterval(() => {
        obstaclePosition += speed;
        obstacle.style.top = obstaclePosition + 'px';

        if (
            obstaclePosition > 420 &&
            obstaclePosition < 500 &&
            Math.abs(carPosition - parseInt(obstacle.style.left)) < (randomType === 'obstacle-wide' ? 70 : 50)
        ) {
            if (!isInvincible) {
                clearInterval(moveObstacle);
                gameContainer.removeChild(obstacle);
                loseLife();
            }
        }

        if (obstaclePosition > 500) {
            clearInterval(moveObstacle);
            gameContainer.removeChild(obstacle);
            score++;
            scoreElement.textContent = score;

            if (score % 10 === 0) {
                level++;
                levelElement.textContent = level;
                increaseDifficulty();
            }
        }
    }, 20);
}

function createPowerUp() {
    powerUp.style.display = 'block';
    powerUp.style.left = Math.floor(Math.random() * 250) + 'px';
    powerUp.style.top = '-50px';

    let powerUpPosition = -50;
    const movePowerUp = setInterval(() => {
        powerUpPosition += speed;
        powerUp.style.top = powerUpPosition + 'px';

        if (
            powerUpPosition > 420 &&
            powerUpPosition < 500 &&
            Math.abs(carPosition - parseInt(powerUp.style.left)) < 50
        ) {
            clearInterval(movePowerUp);
            powerUp.style.display = 'none';
            activatePowerUp();
        }

        if (powerUpPosition > 500) {
            clearInterval(movePowerUp);
            powerUp.style.display = 'none';
        }
    }, 20);
}

function activatePowerUp() {
    isInvincible = true;
    car.classList.add('invincible');
    setTimeout(() => {
        isInvincible = false;
        car.classList.remove('invincible');
    }, 5000);
}

function startGame() {
    gameOverScreen.classList.add('hidden');
    score = 0;
    level = 1;
    lives = 3;
    speed = 5;
    obstacleCreationTime = 1500;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    livesElement.textContent = lives;
    carPosition = 125;
    car.style.left = carPosition + 'px';

    gameInterval = setInterval(createObstacle, obstacleCreationTime);
    powerUpInterval = setInterval(createPowerUp, 10000);
}

function increaseDifficulty() {
    if (speed < 10) {
        speed += 0.5;
    }
    if (obstacleCreationTime > 500) {
        clearInterval(gameInterval);
        obstacleCreationTime -= 100;
        gameInterval = setInterval(createObstacle, obstacleCreationTime);
    }
}

function loseLife() {
    lives--;
    livesElement.textContent = lives;
    if (lives === 0) {
        gameOver();
    }
}

function gameOver() {
    clearInterval(gameInterval);
    clearInterval(powerUpInterval);
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    highScoreElement.textContent = highScore;
}

startGame();