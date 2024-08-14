const car = document.getElementById('car');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score-value');

let carPosition = 125;
let score = 0;

document.addEventListener('keydown', moveCar);

function moveCar(e) {
    if (e.key === 'ArrowLeft' && carPosition > 0) {
        carPosition -= 10;
    }
    if (e.key === 'ArrowRight' && carPosition < 250) {
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
        if (obstaclePosition > 500) {
            clearInterval(moveObstacle);
            gameContainer.removeChild(obstacle);
            score++;
            scoreElement.textContent = score;
        } else if (
            obstaclePosition > 350 &&
            obstaclePosition < 430 &&
            Math.abs(carPosition - parseInt(obstacle.style.left)) < 50
        ) {
            clearInterval(moveObstacle);
            alert('Game Over! Your score: ' + score);
            location.reload();
        } else {
            obstaclePosition += 5;
            obstacle.style.top = obstaclePosition + 'px';
        }
    }, 20);
}

setInterval(createObstacle, 2000);