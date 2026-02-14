import Entity from './Entity.js';
import Bullet from './Bullet.js';

export default class Player extends Entity {
    constructor(x, y) {
        super(x, y, 5, "lime", 20);
        
        this.lives = 10;
        this.maxLives = 10;
        
        this.guitarOrbitRadius = 45;
        this.guitarAngle = 0;
        
        this.lastShotTime = 0;
        this.shotDelay = 150;

        // Chargement de l'image
        this.guitarSprite = new Image();
        this.guitarSprite.src = './assets/guitar.png';
        
        this.isSpriteLoaded = false;
        
        // Quand l'image est chargée, on active le drapeau
        this.guitarSprite.onload = () => {
            this.isSpriteLoaded = true;
            console.log("Guitare chargée !");
        };
        
        // Gestion d'erreur : si l'image plante, on reste sur la forme de base
        this.guitarSprite.onerror = () => {
            console.log("Erreur chargement image, utilisation forme vectorielle.");
            this.isSpriteLoaded = false;
        };
    }

    update(input, canvas) {
        // Déplacement
        if (input.keys['ArrowUp'] || input.keys['z']) this.y -= this.speed;
        if (input.keys['ArrowDown'] || input.keys['s']) this.y += this.speed;
        if (input.keys['ArrowLeft'] || input.keys['q']) this.x -= this.speed;
        if (input.keys['ArrowRight'] || input.keys['d']) this.x += this.speed;

        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

        let dx = input.mouse.x - this.x;
        let dy = input.mouse.y - this.y;
        this.angle = Math.atan2(dy, dx);
        this.guitarAngle = this.angle;
    }

    tryShoot(time) {
        if (time - this.lastShotTime > this.shotDelay) {
            this.lastShotTime = time;
            // Ajustement de la sortie du canon
            // Si on a l'image, le canon est un peu plus loin visuellement
            let offset = this.isSpriteLoaded ? 30 : 20; 
            let spawnDistance = this.guitarOrbitRadius + offset; 
            
            let bx = this.x + Math.cos(this.angle) * spawnDistance;
            let by = this.y + Math.sin(this.angle) * spawnDistance;
            return new Bullet(bx, by, this.angle);
        }
        return null;
    }

    getLifeColor() {
        if (this.lives > this.maxLives * 0.6) return "#2ecc71";
        if (this.lives > this.maxLives * 0.3) return "#f1c40f";
        return "#e74c3c";
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // --- 1. DESSIN DU CORPS DU JOUEUR ---
        ctx.fillStyle = this.getLifeColor();
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Lunettes
        ctx.fillStyle = "black";
        ctx.fillRect(-10, -5, 20, 6);

        // --- 2. DESSIN DE LA GUITARE ---
        ctx.save(); 
            // Rotation globale vers la souris
            ctx.rotate(this.guitarAngle);
            // Décalage pour l'orbite
            ctx.translate(this.guitarOrbitRadius, 0);
            
            // Effet de brillance (Glow)
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.getLifeColor();

            // LOGIQUE DE DESSIN : IMAGE OU VECTEUR
            if (this.isSpriteLoaded) {
                // --- CAS A : L'IMAGE EST PRÊTE ---
                let displayWidth = 60; 
                let ratio = this.guitarSprite.height / this.guitarSprite.width;
                let displayHeight = displayWidth * ratio;

                // Centrage de l'image
                ctx.drawImage(
                    this.guitarSprite, 
                    -displayWidth / 2, 
                    -displayHeight / 2, 
                    displayWidth, 
                    displayHeight
                );
            } else {
                // --- CAS B : FALLBACK VECTORIEL ---
                
                // Manche (blanc)
                ctx.fillStyle = "#ecf0f1";
                ctx.fillRect(0, -3, 30, 6); 

                // Corps (couleur de la vie)
                ctx.fillStyle = this.getLifeColor();
                ctx.beginPath();
                ctx.moveTo(0, -10);
                ctx.lineTo(-15, -15);
                ctx.lineTo(5, 0); 
                ctx.lineTo(-15, 15);
                ctx.lineTo(0, 10);
                ctx.fill();
            }
            
            ctx.shadowBlur = 0;
        ctx.restore();

        ctx.restore();
    }
}