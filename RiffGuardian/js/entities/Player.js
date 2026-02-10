import Entity from './Entity.js';
import Bullet from './Bullet.js';

export default class Player extends Entity {
    constructor(x, y) {
        super(x, y, 5, "lime", 20); // Vitesse un peu augmentée à 5
        
        this.lives = 10; // On part avec 10 vies pour bien voir le dégradé
        this.maxLives = 10;
        
        this.guitarOrbitRadius = 45;
        this.guitarAngle = 0;
        
        this.lastShotTime = 0;
        this.shotDelay = 150; 
    }

    update(input, canvas) {
        // Déplacement
        if (input.keys['ArrowUp'] || input.keys['z']) this.y -= this.speed;
        if (input.keys['ArrowDown'] || input.keys['s']) this.y += this.speed;
        if (input.keys['ArrowLeft'] || input.keys['q']) this.x -= this.speed;
        if (input.keys['ArrowRight'] || input.keys['d']) this.x += this.speed;

        // Limites écran
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

        // Angle vers souris
        let dx = input.mouse.x - this.x;
        let dy = input.mouse.y - this.y;
        this.angle = Math.atan2(dy, dx);
        this.guitarAngle = this.angle;
    }

    tryShoot(time) {
        if (time - this.lastShotTime > this.shotDelay) {
            this.lastShotTime = time;
            let spawnDistance = this.guitarOrbitRadius + 20; 
            let bx = this.x + Math.cos(this.angle) * spawnDistance;
            let by = this.y + Math.sin(this.angle) * spawnDistance;
            return new Bullet(bx, by, this.angle);
        }
        return null;
    }

    // Gestion de la couleur dynamique selon la vie
    getLifeColor() {
        if (this.lives > this.maxLives * 0.6) return "#2ecc71"; // Vert (En forme)
        if (this.lives > this.maxLives * 0.3) return "#f1c40f"; // Jaune (Attention)
        return "#e74c3c"; // Rouge (Danger)
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // --- DESSIN DU CORPS (Couleur dynamique) ---
        ctx.fillStyle = this.getLifeColor();
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI*2);
        ctx.fill();
        
        // Bordure blanche pour faire ressortir
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Lunettes
        ctx.fillStyle = "black";
        ctx.fillRect(-10, -5, 20, 6);

        // --- DESSIN DE LA GUITARE ---
        ctx.save(); 
            ctx.rotate(this.guitarAngle);
            ctx.translate(this.guitarOrbitRadius, 0);
            
            // Guitare
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.getLifeColor(); // La guitare brille comme la vie
            
            ctx.fillStyle = "#ecf0f1";
            ctx.fillRect(0, -3, 30, 6); 

            ctx.fillStyle = this.getLifeColor(); // Corps guitare assorti
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(-15, -15);
            ctx.lineTo(5, 0); 
            ctx.lineTo(-15, 15);
            ctx.lineTo(0, 10);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        ctx.restore();

        ctx.restore();
    }
}