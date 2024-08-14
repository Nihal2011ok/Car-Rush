class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.car = { x: 125, y: 420, width: 50, height: 80 };
        this.obstacles = [];
        this.powerUps = [];
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.boost = 100;
        this.shield = 0;
        this.speed = 5;
        this.obstacleCreationTime = 1500;
        this.isInvincible = false;
        this.isPaused = false;
        this.gameLoop = null;
        this.obstacleInterval = null;
        this.powerUpInterval = null;
        this.boostRechargeInterval = null;

        this.setupEventListeners();
        this.setupAudio();
        this.loadHighScore();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('options-button').addEventListener('click', () => this.showScreen('options-screen'));
        document.getElementById('leaderboard-button').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('restart-button').addEventListener('click', () => this.startGame());
        document.getElementById('menu-button').addEventListener('click', () => this.showScreen('menu-screen'));
        document.getElementById('resume-button').addEventListener('click', () => this.resumeGame());
        document.getElementById('quit-button').addEventListener('click', () => this.quitGame());
        document.getElementById('save-options').addEventListener('click', () => this.saveOptions());
        document.getElementById('options-back').addEventListener('click', () => this.showScreen('menu-screen'));
        document.getElementById('leaderboard-back').addEventListener('click', () => this.showScreen('menu-screen'));
    }

    setupAudio() {
        this.backgroundMusic = new Howl({
            src: ['background-music.mp3'],
            loop: true,
            volume: 0.5
        });

        this.collisionSound = new Howl({
            src: ['collision.mp3'],
            volume: 0.5
        });

        this.powerUpSound = new Howl({
            src: ['power-up.mp3'],
            volume: 0.5
        });
    }

    loadHighScore() {
        this.highScore = localStorage.getItem('highScore') || 0;
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
    }

    startGame() {
        this.resetGame();
        this.showScreen('game-canvas');
        this.backgroundMusic.play();
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
        this.obstacleInterval = setInterval(this.createObstacle.bind(this), this.obstacleCreationTime);
        this.powerUpInterval = setInterval(this.createPowerUp.bind(this), 10000);
        this.boostRechargeInterval = setInterval(this.rechargeBoost.bind(this), 1000);
    }

    resetGame() {
        this.car = { x: 125, y: 420, width: 50, height: 80 };
        this.obstacles = [];
        this.powerUps = [];
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.boost = 100;
        this.shield = 0;
        this.speed = 5;
        this.obstacleCreationTime = 1500;
        this.isInvincible = false;
        this.isPaused = false;
    }

    update() {
        if (!this.isPaused) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawCar();
            this.updateObstacles();
            this.updatePowerUps();
            this.updateUI();
            this.gameLoop = requestAnimationFrame(this.update.bind(this));
        }
    }

    drawCar() {
        this.ctx.fillStyle = this.isInvincible ? 'gold' : 'red';
        this.ctx.fillRect(this.car.x, this.car.y, this.car.width, this.car.height);
    }

    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += this.speed;
            this.ctx.fillStyle = obstacle.color;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

            if (this.checkCollision(obstacle)) {
                if (!this.isInvincible) {
                    this.loseLife();
                }
                this.obstacles.splice(i, 1);
            } else if (obstacle.y > this.canvas.height) {
                this.obstacles.splice(i, 1);
                this.score++;
                if (this.score % 10 === 0) {
                    this.levelUp();
                }
            }
        }
    }

    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += this.speed;
            this.ctx.fillStyle = 'green';
            this.ctx.beginPath();
            this.ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
            this.ctx.fill();

            if (this.checkCollision(powerUp)) {
                this.activatePowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
            } else if (powerUp.y > this.canvas.height) {
                this.powerUps.splice(i, 1);
            }
        }
    }

    updateUI() {
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('level-value').textContent = this.level;
        document.getElementById('lives-value').textContent = this.lives;
        document.getElementById('boost-value').textContent = this.boost;
        document.getElementById('shield-value').textContent = this.shield;
    }

    createObstacle() {
        const obstacleTypes = [
            { width: 50, height: 50, color: 'white' },
            { width: 70, height: 50, color: 'yellow' },
            { width: 50, height: 50, color: 'blue' }
        ];
        const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const obstacle = {
            x: Math.random() * (this.canvas.width - randomType.width),
            y: -randomType.height,
            width: randomType.width,
            height: randomType.height,
            color: randomType.color
        };
        this.obstacles.push(obstacle);
    }

    createPowerUp() {
        const powerUpTypes = ['invincibility', 'shield', 'extraLife'];
        const powerUp = {
            x: Math.random() * this.canvas.width,
            y: -15,
            radius: 15,
            type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
        };
        this.powerUps.push(powerUp);
    }

    checkCollision(object) {
        return (
            this.car.x < object.x + object.width &&
            this.car.x + this.car.width > object.x &&
            this.car.y < object.y + object.height &&
            this.car.y + this.car.height > object.y
        );
    }

    loseLife() {
        if (this.shield > 0) {
            this.shield = 0;
        } else {
            this.lives--;
            this.collisionSound.play();
            if (this.lives === 0) {
                this.gameOver();
            }
        }
    }

    levelUp() {
        this.level++;
        this.speed += 0.5;
        if (this.obstacleCreationTime > 500) {
            clearInterval(this.obstacleInterval);
            this.obstacleCreationTime -= 100;
            this.obstacleInterval = setInterval(this.createObstacle.bind(this), this.obstacleCreationTime);
        }
    }

    activatePowerUp(type) {
        this.powerUpSound.play();
        switch (type) {
            case 'invincibility':
                this.isInvincible = true;
                setTimeout(() => { this.isInvincible = false; }, 5000);
                break;
            case 'shield':
                this.shield = 100;
                break;
            case 'extraLife':
                this.lives++;
                break;
        }
    }

    handleKeyPress(e) {
        if (e.key === 'ArrowLeft' && this.car.x > 0) {
            this.car.x -= 10;
        } else if (e.key === 'ArrowRight' && this.car.x < this.canvas.width - this.car.width) {
            this.car.x += 10;
        } else if (e.key === 'ArrowUp' && this.boost > 0) {
            this.activateBoost();
        } else if (e.key === 'ArrowDown') {
            this.pauseGame();
        }
    }

    activateBoost() {
        this.boost -= 10;
        this.speed += 2;
        setTimeout(() => {
            this.speed -= 2;
        }, 1000);

        if (this.boost <= 0) {
            this.boost = 0;
        }
    }

    rechargeBoost() {
        if (this.boost < 100) {
            this.boost += 5;
            if (this.boost > 100) {
                this.boost = 100;
            }
        }
    }

    pauseGame() {
        this.isPaused = true;
        this.showScreen('pause-screen');
        cancelAnimationFrame(this.gameLoop);
        clearInterval(this.obstacleInterval);
        clearInterval(this.powerUpInterval);
        clearInterval(this.boostRechargeInterval);
        this.backgroundMusic.pause();
    }

    resumeGame() {
        this.isPaused = false;
        this.showScreen('game-canvas');
        this.backgroundMusic.play();
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
        this.obstacleInterval = setInterval(this.createObstacle.bind(this), this.obstacleCreationTime);
        this.powerUpInterval = setInterval(this.createPowerUp.bind(this), 10000);
        this.boostRechargeInterval = setInterval(this.rechargeBoost.bind(this), 1000);
    }

    quitGame() {
        this.pauseGame();
        this.showScreen('menu-screen');
    }

    saveOptions() {
        const musicVolume = document.getElementById('music-volume').value / 100;
        const sfxVolume = document.getElementById('sfx-volume').value / 100;
        const difficulty = document.getElementById('difficulty').value;

        this.backgroundMusic.volume(musicVolume);
        this.collisionSound.volume(sfxVolume);
        this.powerUpSound.volume(sfxVolume);

        switch (difficulty) {
            case 'easy':
                this.speed = 3;
                this.lives = 5;
                break;
            case 'medium':
                this.speed = 5;
                this.lives = 3;
                break;
            case 'hard':
                this.speed = 7;
                this.lives = 2;
                break;
        }

        this.showScreen('menu-screen');
    }

    showLeaderboard() {
        const leaderboard = [
            { name: "Player1", score: 5000 },
            { name: "Player2", score: 4500 },
            { name: "Player3", score: 4000 }
        ];

        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';

        leaderboard.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `${player.name}: ${player.score}`;
            leaderboardList.appendChild(li);
        });

        this.showScreen('leaderboard-screen');
    }

    gameOver() {
        this.pauseGame();
        this.backgroundMusic.stop();
        this.saveHighScore();

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;

        this.showScreen('game-over-screen');
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
