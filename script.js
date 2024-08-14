const car = document.getElementById('car');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score-value');
const levelElement = document.getElementById('level-value');
const livesElement = document.getElementById('lives-value');
const boostElement = document.getElementById('boost-value');
const gameOverScreen = document.getElementById('game-over');
const pauseMenu = document.getElementById('pause-menu');
const finalScoreElement = document.getElementById('final-score');
const highScoreElement = document.getElementById('high-score');
const restartButton = document.getElementById('restart-button');
const resumeButton = document.getElementById('resume-button');
const quitButton = document.getElementById('quit-button');
const powerUp = document.getElementById('power-up');
const backgroundMusic = document.getElementById('background-music');
const collisionSound = document.getElementById('collision-sound');
const powerUpSound = document.getElementById('power-up-sound');

let carPosition = 125;
let score = 0;
let level = 1;
let lives = 3;
let boost = 100;
let gameInterval;
let obstacleInterval;
let powerUpInterval;
let boostRechargeInterval;
let speed = 5;
let obstacleCreationTime = 1500;
let obstacleTypes = ['obstacle', 'obstacle-wide', 'obstacle-fast'];
let isInvincible = false;
let isPaused = false;
let highScore = localStorage.getItem('highScore') || 0;

document.addEventListener('keydown', handleKeyPress);
restartButton.addEventListener('click', startGame);
resumeButton.addEventListener('click', resumeGame);
quitButton.addEventListener('click', quitGame);

function handleKeyPress(e) {
    if (e.key === 'ArrowLeft' && carPosition > 0) {
        carPosition -= 10;
    } else if (e.key === 'ArrowRight' && carPosition < 250) {
        carPosition += 10;
    } else if (e.key === 'ArrowUp' && boost > 0) {
        activateBoost();
    } else if (e.key === 'p' || e.key === 'P') {
        togglePause();
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
        if (!isPaused) {
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
        }
    }, 20);
}

function createPowerUp() {
    powerUp.style.display = 'block';
    powerUp.style.left = Math.floor(Math.random() * 250) + 'px';
    powerUp.style.top = '-50px';

    let powerUpPosition = -50;
    const movePowerUp = setInterval(() => {
        if (!isPaused) {
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
        }
    }, 20);
}

function activatePowerUp() {
    isInvincible = true;
    car.classList.add('invincible');
    powerUpSound.play();
    setTimeout(() => {
        isInvincible = false;
        car.classList.remove('invincible');
    }, 5000);
}

function activateBoost() {
    if (boost > 0) {
        speed *= 1.5;
        boost -= 20;
        boostElement.textContent = boost;
        setTimeout(() => {
            speed /= 1.5;
        }, 1000);
    }
}

function rechargeBoost() {
    if (boost < 100) {
        boost += 1;
        boostElement.textContent = boost;
    }
}

function startGame() {
    gameOverScreen.classList.add('hidden');
    pauseMenu.classList.add('hidden');
    score = 0;
    level = 1;
    lives = 3;
    boost = 100;
    speed = 5;
    obstacleCreationTime = 1500;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    livesElement.textContent = lives;
    boostElement.textContent = boost;
    carPosition = 125;
    car.style.left = carPosition + 'px';
    isPaused = false;

    backgroundMusic.play();
    gameInterval = setInterval(createObstacle, obstacleCreationTime);
    powerUpInterval = setInterval(createPowerUp, 10000);
    boostRechargeInterval = setInterval(rechargeBoost, 1000);
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
    collisionSound.play();
    if (lives === 0) {
        gameOver();
    }
}

function gameOver() {
    clearInterval(gameInterval);
    clearInterval(powerUpInterval);
    clearInterval(boostRechargeInterval);
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    highScoreElement.textContent = highScore;
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseMenu.classList.remove('hidden');
        backgroundMusic.pause();
    } else {
        pauseMenu.classList.add('hidden');
        backgroundMusic.play();
    }
}

function resumeGame() {
    togglePause();
}

function quitGame() {
    gameOver();
}

startGame();