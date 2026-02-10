import Player from './entities/Player.js';
import Enemy from './entities/Enemy.js';
import InputListeners from './InputListeners.js';
import { distance } from './utils.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = new InputListeners(canvas);

        this.gameStates = {
            MENU: 0,
            PLAYING: 1,
            GAMEOVER: 2,
            TRANSITION: 3
        };
        this.currentGameState = this.gameStates.MENU;

        this.player = null;
        this.enemies = [];
        this.bullets = [];
        
        this.level = 1;
        this.score = 0;
        this.highScores = JSON.parse(localStorage.getItem('riffGuardianScores')) || [0];

        this.lastTime = 0;
        
        // Gestion du Chrono
        this.levelTimer = 0;
        this.levelDuration = 10;
        
        this.enemySpawnTimer = 0;
        this.spawnRate = 2000;

        this.debugCheckbox = document.getElementById('cb-debug');
        this.shieldCheckbox = document.getElementById('cb-shield');
    }

    start() {
        requestAnimationFrame((time) => this.loop(time));
    }

    initLevel(levelNum) {
        this.level = levelNum;
        
        if (this.level === 1) {
            this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
            this.score = 0;
        } else {
            this.player.x = this.canvas.width / 2;
            this.player.y = this.canvas.height / 2;
            this.player.bullets = []; 
        }

        this.enemies = [];
        this.bullets = [];
        
        this.levelDuration = 10 + (this.level - 1) * 2;
        this.levelTimer = 0;

        this.spawnRate = 1800 * Math.pow(0.85, (this.level - 1));
        if (this.spawnRate < 250) this.spawnRate = 250;
        
        console.log(`Niveau ${this.level}. Durée: ${this.levelDuration}s. Spawn: ${Math.floor(this.spawnRate)}ms`);
    }

    loop(time) {
        let dt = time - this.lastTime;
        this.lastTime = time;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.currentGameState) {
            case this.gameStates.MENU:
                this.updateMenu();
                this.drawMenu();
                break;
            case this.gameStates.PLAYING:
                this.updatePlaying(dt, time);
                this.drawPlaying();
                break;
            case this.gameStates.TRANSITION:
                this.drawTransition();
                break;
            case this.gameStates.GAMEOVER:
                this.updateGameOver();
                this.drawGameOver();
                break;
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    startTransition() {
        this.currentGameState = this.gameStates.TRANSITION;
        setTimeout(() => {
            this.initLevel(this.level + 1);
            this.currentGameState = this.gameStates.PLAYING;
        }, 2000);
    }

    drawTransition() {
        this.ctx.save();
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#3498db";
        this.ctx.font = "40px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`NIVEAU ${this.level} TERMINÉ`, this.canvas.width/2, this.canvas.height/2 - 20);
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(`Prochain niveau : ${10 + (this.level) * 2} secondes`, this.canvas.width/2, this.canvas.height/2 + 30);
        this.ctx.restore();
    }

    updateMenu() {
        if (this.input.keys['Enter']) {
            this.initLevel(1);
            this.currentGameState = this.gameStates.PLAYING;
        }
    }

    drawMenu() {
        this.ctx.save();
        this.ctx.textAlign = "center";
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = "#e74c3c";
        this.ctx.fillStyle = "#e74c3c";
        this.ctx.font = "60px Arial";
        this.ctx.fillText("RIFF GUARDIAN", this.canvas.width/2, 200);
        this.ctx.shadowBlur = 0;
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.fillText("Appuyez sur ENTRÉE", this.canvas.width/2, 300);
        this.ctx.restore();
    }

    updatePlaying(dt, time) {
        this.player.update(this.input, this.canvas);

        let isShieldActive = this.shieldCheckbox ? this.shieldCheckbox.checked : false;

        if (this.input.mouse.leftClick || this.input.keys[' ']) {
            let bullet = this.player.tryShoot(time);
            if (bullet) this.bullets.push(bullet);
        }

        this.levelTimer += dt / 1000;
        if (this.levelTimer >= this.levelDuration) {
            this.startTransition();
            return;
        }

        this.enemySpawnTimer += dt;
        if (this.enemySpawnTimer > this.spawnRate) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }

        this.bullets.forEach(b => b.update(this.canvas.width, this.canvas.height));
        
        this.enemies.forEach(e => {
            e.update(this.player, this.canvas.width, this.canvas.height);
            
            let hitDist = distance(e.x, e.y, this.player.x, this.player.y);
            let minDist = e.radius + this.player.radius + (isShieldActive ? 15 : 0);

            if (hitDist < minDist) {
                if (isShieldActive) {
                    if(typeof e.bounce === 'function') e.bounce(this.player);
                } else {
                    e.markedForDeletion = true;
                    this.player.lives--;
                    this.canvas.style.borderColor = "red";
                    setTimeout(() => this.canvas.style.borderColor = "#e74c3c", 100);

                    if (this.player.lives <= 0) {
                        this.saveScore();
                        this.currentGameState = this.gameStates.GAMEOVER;
                    }
                }
            }
        });

        this.bullets.forEach(b => {
            this.enemies.forEach(e => {
                if (!b.markedForDeletion && !e.markedForDeletion) {
                    if (distance(b.x, b.y, e.x, e.y) < b.radius + e.radius) {
                        b.markedForDeletion = true;
                        let isDead = e.hit();
                        if(isDead) {
                            if(e.type === 'tank') this.score += 50;
                            else if(e.type === 'linear') this.score += 40;
                            else if(e.type === 'fast') this.score += 30;
                            else this.score += 10;
                        }
                    }
                }
            });
        });

        this.bullets = this.bullets.filter(b => !b.markedForDeletion);
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
    }

    spawnEnemy() {
        let x, y;
        if(Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 : this.canvas.width;
            y = Math.random() * this.canvas.height;
        } else {
            x = Math.random() * this.canvas.width;
            y = Math.random() < 0.5 ? 0 : this.canvas.height;
        }

        let rand = Math.random();
        let type = 'linear'; 
        let target = null;

        if (this.level === 1) {
            type = 'linear';
        } else if (this.level === 2) {
            if (rand < 0.6) type = 'normal';
            else type = 'linear';
        } else {
            if (rand < 0.15) type = 'tank';       
            else if (rand < 0.45) type = 'fast';  
            else if (rand < 0.75) type = 'normal';
            else type = 'linear';                 
        }

        if (type === 'linear') {
            target = this.player;
        }

        this.enemies.push(new Enemy(x, y, this.level, type, target));
    }

    drawPlaying() {
        let isDebug = this.debugCheckbox ? this.debugCheckbox.checked : false;
        let isShield = this.shieldCheckbox ? this.shieldCheckbox.checked : false;

        if(isShield) {
            this.ctx.save();
            this.ctx.translate(this.player.x, this.player.y);
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.player.radius + 15, 0, Math.PI*2);
            this.ctx.strokeStyle = "cyan";
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.fillStyle = "rgba(0, 255, 255, 0.1)";
            this.ctx.fill();
            this.ctx.restore();
        }

        this.player.draw(this.ctx);
        this.bullets.forEach(b => b.draw(this.ctx));
        
        // CORRECTION ICI : On passe isDebug à TOUS les ennemis sans condition
        this.enemies.forEach(e => {
            e.draw(this.ctx, isDebug); 
        });

        // HUD
        this.ctx.save();
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        this.ctx.fillText(`Level: ${this.level}`, 20, 60);
        
        let timeLeft = Math.max(0, (this.levelDuration - this.levelTimer).toFixed(1));
        this.ctx.fillStyle = timeLeft < 3 ? "red" : "#2ecc71";
        this.ctx.fillText(`Temps: ${timeLeft}s`, 150, 30);

        this.ctx.fillStyle = this.player.getLifeColor ? this.player.getLifeColor() : "white";
        this.ctx.fillText(`Vies: ${this.player.lives}`, 20, 90);
        this.ctx.restore();
    }

    updateGameOver() {
        if (this.input.keys['Enter']) {
            this.currentGameState = this.gameStates.MENU;
        }
    }

    saveScore() {
        this.highScores.push(this.score);
        this.highScores.sort((a, b) => b - a);
        this.highScores = this.highScores.slice(0, 5);
        localStorage.setItem('riffGuardianScores', JSON.stringify(this.highScores));
    }

    drawGameOver() {
        this.ctx.save();
        this.ctx.fillStyle = "red";
        this.ctx.font = "50px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("GAME OVER", this.canvas.width/2, 200);
        this.ctx.fillStyle = "white";
        this.ctx.font = "30px Arial";
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width/2, 300);
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Entrée pour Menu", this.canvas.width/2, 400);
        this.ctx.restore();
    }
}