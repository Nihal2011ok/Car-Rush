const car = document.getElementById('car');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score-value');
const levelElement = document.getElementById('level-value');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

let carPosition = 125;
let score = 0;
let level = 1;
let gameInterval;
let obstacleInterval;
let speed = 5;
let obstacleCreationTime = 1500;
let obstacleTypes = ['obstacle', 'obstacle-wide', 'obstacle-fast'];

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
            clearInterval(moveObstacle);
            gameOver();
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

function startGame() {
    gameOverScreen.classList.add('hidden');
    score = 0;
    level = 1;
    speed = 5;
    obstacleCreationTime = 1500;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    carPosition = 125;
    car.style.left = carPosition + 'px';

    gameInterval = setInterval(createObstacle, obstacleCreationTime);
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

function gameOver() {
    clearInterval(gameInterval);
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
}

startGame();
