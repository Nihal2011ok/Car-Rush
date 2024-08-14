const car = document.getElementById('car');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score-value');

let carPosition = 125;
let score = 0;
let gameInterval;
let obstacleInterval;

document.addEventListener('keydown', moveCar);

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
    obstacle.classList.add('obstacle');
    obstacle.style.left = Math.floor(Math.random() * 250) + 'px';
    gameContainer.appendChild(obstacle);

    let obstaclePosition = -50;
    const moveObstacle = setInterval(() => {
        obstaclePosition += 5;
        obstacle.style.top = obstaclePosition + 'px';
        if (
            obstaclePosition > 420 &&
            obstaclePosition < 500 &&
            Math.abs(carPosition - parseInt(obstacle.style.left)) < 50
        ) {
            clearInterval(moveObstacle);
            gameOver();
        }

        
        if (obstaclePosition > 500) {
            clearInterval(moveObstacle);
            gameContainer.removeChild(obstacle);
            score++;
            scoreElement.textContent = score;
        }
    }, 20);
}

function startGame() {
    score = 0;
    scoreElement.textContent = score;
    gameInterval = setInterval(createObstacle, 1500);
}

function gameOver() {
    clearInterval(gameInterval);
    alert('Game Over! Your score: ' + score);
    location.reload();
}

startGame();
