class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 600;
        this.car = { x: 175, y: 500, width: 50, height: 80 };
        this.obstacles = [];
        this.powerUps = [];
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.boost = 100;
        this.shield = 0;
        this.speed = 2;
        this.obstacleCreationTime = 1500;
        this.powerUpCreationTime = 5000;
        this.isInvincible = false;
        this.isPaused = false;
        this.gameLoop = null;
        this.obstacleInterval = null;
        this.powerUpInterval = null;
        this.boostRechargeInterval = null;

        this.setupEventListeners();
        this.loadHighScore();
        this.loadOptions();
        this.setupAudio();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('car-select-button').addEventListener('click', () => this.showCarSelect());
        document.getElementById('options-button').addEventListener('click', () => this.showOptions());
        document.getElementById('restart-button').addEventListener('click', () => this.startGame());
        document.getElementById('menu-button').addEventListener('click', () => this.showScreen('menu-screen'));
        document.getElementById('resume-button').addEventListener('click', () => this.resumeGame());
        document.getElementById('quit-button').addEventListener('click', () => this.quitGame());
        document.getElementById('car-select-back').addEventListener('click', () => this.showScreen('menu-screen'));
        document.getElementById('options-back').addEventListener('click', () => this.showScreen('menu-screen'));
        document.getElementById('sfx-volume').addEventListener('change', (e) => this.updateVolume('sfx', e.target.value));
        document.getElementById('music-volume').addEventListener('change', (e) => this.updateVolume('music', e.target.value));
    }

    loadHighScore() {
        this.highScore = localStorage.getItem('highScore') || 0;
    }

    loadOptions() {
        this.sfxVolume = localStorage.getItem('sfxVolume') || 50;
        this.musicVolume = localStorage.getItem('musicVolume') || 50;
        document.getElementById('sfx-volume').value = this.sfxVolume;
        document.getElementById('music-volume').value = this.musicVolume;
    }

    setupAudio() {
        this.sounds = {
            background: new Audio('background.mp3'),
            collision: new Audio('collision.mp3'),
            powerUp: new Audio('powerup.mp3')
        };
        this.sounds.background.loop = true;
        this.updateVolume('sfx', this.sfxVolume);
        this.updateVolume('music', this.musicVolume);
    }

    updateVolume(type, value) {
        if (type === 'sfx') {
            this.sfxVolume = value;
            this.sounds.collision.volume = value / 100;
            this.sounds.powerUp.volume = value / 100;
            localStorage.setItem('sfxVolume', value);
        } else if (type === 'music') {
            this.musicVolume = value;
            this.sounds.background.volume = value / 100;
            localStorage.setItem('musicVolume', value);
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
    }

    startGame() {
        this.resetGame();
        this.showScreen('game-canvas');
        this.sounds.background.play();
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
        this.obstacleInterval = setInterval(this.createObstacle.bind(this), this.obstacleCreationTime);
        this.powerUpInterval = setInterval(this.createPowerUp.bind(this), this.powerUpCreationTime);
        this.boostRechargeInterval = setInterval(this.rechargeBoost.bind(this), 1000);
    }

    resetGame() {
        this.car = { x: 175, y: 500, width: 50, height: 80 };
        this.obstacles = [];
        this.powerUps = [];
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.boost = 100;
        this.shield = 0;
        this.speed = 2;
        this.obstacleCreationTime = 1500;
        this.isInvincible = false;
        this.isPaused = false;
    }

    update() {
        if (!this.isPaused) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawRoad();
            this.drawCar();
            this.updateObstacles();
            this.updatePowerUps();
            this.updateUI();
            this.gameLoop = requestAnimationFrame(this.update.bind(this));
        }
    }

    drawRoad() {
        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < this.canvas.height; i += 40) {
            this.ctx.fillRect(this.canvas.width / 2 - 5, i, 10, 20);
        }
    }

    drawCar() {
       
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(this.car.x, this.car.y, this.car.width, this.car.height);
        
        
        if (this.isInvincible) {
            this.ctx.strokeStyle = 'gold';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(this.car.x, this.car.y, this.car.width, this.car.height);
        }
        
        
        if (this.shield > 0) {
            this.ctx.strokeStyle = 'cyan';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.car.x + this.car.width / 2, this.car.y + this.car.height / 2, 
                         Math.max(this.car.width, this.car.height) / 2 + 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += this.speed;
            this.ctx.fillStyle = obstacle.color;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

            if (this.checkCollision(obstacle)) {
                if (!this.isInvincible && this.shield === 0) {
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
            this.ctx.fillStyle = powerUp.color;
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

    checkCollision(rect) {
        return !(this.car.x > rect.x + rect.width ||
                 this.car.x + this.car.width < rect.x ||
                 this.car.y > rect.y + rect.height ||
                 this.car.y + this.car.height < rect.y);
    }

    loseLife() {
        this.lives--;
        if (this.lives === 0) {
            this.endGame();
        } else {
            this.isInvincible = true;
            setTimeout(() => this.isInvincible = false, 2000);
        }
    }

    endGame() {
        cancelAnimationFrame(this.gameLoop);
        clearInterval(this.obstacleInterval);
        clearInterval(this.powerUpInterval);
        clearInterval(this.boostRechargeInterval);
        this.sounds.background.pause();
        this.sounds.background.currentTime = 0;
        this.updateHighScore();
        this.showScreen('game-over-screen');
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            document.getElementById('high-score-value').textContent = this.highScore;
        }
    }

    createObstacle() {
        const width = Math.random() * 50 + 30;
        const height = Math.random() * 30 + 30;
        const x = Math.random() * (this.canvas.width - width);
        const color = 'red';
        this.obstacles.push({ x, y: -height, width, height, color });
    }

    createPowerUp() {
        const radius = 15;
        const x = Math.random() * (this.canvas.width - radius * 2) + radius;
        const type = Math.random() < 0.5 ? 'boost' : 'shield';
        const color = type === 'boost' ? 'yellow' : 'blue';
        this.powerUps.push({ x, y: -radius * 2, radius, type, color });
    }

    activatePowerUp(type) {
        if (type === 'boost') {
            this.boost = Math.min(100, this.boost + 20);
        } else if (type === 'shield') {
            this.shield = Math.min(3, this.shield + 1);
        }
        this.sounds.powerUp.play();
    }

    rechargeBoost() {
        if (this.boost < 100) {
            this.boost++;
        }
    }

    levelUp() {
        this.level++;
        this.speed += 0.5;
        this.obstacleCreationTime = Math.max(500, this.obstacleCreationTime - 100);
        clearInterval(this.obstacleInterval);
        this.obstacleInterval = setInterval(this.createObstacle.bind(this), this.obstacleCreationTime);
    }

    handleKeyPress(e) {
        if (e.key === 'ArrowLeft') {
            this.moveCar(-10);
        } else if (e.key === 'ArrowRight') {
            this.moveCar(10);
        } else if (e.key === 'ArrowUp') {
            this.moveCar(0, -10);
        } else if (e.key === 'ArrowDown') {
            this.moveCar(0, 10);
        } else if (e.key === ' ') {
            this.togglePause();
        }
    }

    moveCar(dx = 0, dy = 0) {
        if (this.boost > 0 && (dx !== 0 || dy !== 0)) {
            dx *= 1.5;
            dy *= 1.5;
            this.boost--;
        }
        this.car.x = Math.min(this.canvas.width - this.car.width, Math.max(0, this.car.x + dx));
        this.car.y = Math.min(this.canvas.height - this.car.height, Math.max(0, this.car.y + dy));
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.gameLoop = requestAnimationFrame(this.update.bind(this));
        }
    }

    resumeGame() {
        this.showScreen('game-canvas');
        this.togglePause();
    }

    quitGame() {
        this.endGame();
        this.showScreen('menu-screen');
    }

    showCarSelect() {
        this.showScreen('car-select-screen');
    }

    showOptions() {
        this.showScreen('options-screen');
    }
}

window.onload = () => {
    const game = new Game();
    document.getElementById('high-score-value').textContent = game.highScore;
};
