import Entity from './Entity.js';
import { distance } from '../utils.js';

export default class Enemy extends Entity {
    constructor(x, y, level, type = 'normal', target = null) {
        let speed, color, radius, hp;

        switch(type) {
            case 'linear': // Le "Kamikaze"
                speed = 5 + (Math.random() * 3) + (level * 0.3);
                color = "#00ff88"; 
                radius = 8 + Math.random() * 17;
                hp = 1;
                break;
            case 'fast':
                speed = 3.5 + (level * 0.25);
                color = "#e67e22";
                radius = 12;
                hp = 1;
                break;
            case 'tank':
                speed = 1.0 + (level * 0.1);
                color = "#8e44ad";
                radius = 30;
                hp = 3;
                break;
            case 'normal':
            default:
                speed = 2.0 + (level * 0.2);
                color = "#e74c3c";
                radius = 18;
                hp = 1;
                break;
        }

        super(x, y, speed, color, radius);
        this.type = type;
        this.hp = hp;
        this.pulse = 0;
        
        this.vx = 0;
        this.vy = 0;

        // CALCUL DE TRAJECTOIRE (Pour les ennemis linéaires)
        if (this.type === 'linear' && target) {
            let d = distance(x, y, target.x, target.y);
            if (d > 0) {
                this.vx = ((target.x - x) / d) * this.speed;
                this.vy = ((target.y - y) / d) * this.speed;
                this.angle = Math.atan2(this.vy, this.vx);
            }
        }
    }

    update(player, canvasWidth, canvasHeight) {
        if (this.type === 'linear') {
            // Mouvement constant
            this.x += this.vx;
            this.y += this.vy;
            this.angle += 0.3;

            // Suppression hors écran
            if (this.x < -200 || this.x > canvasWidth + 200 || 
                this.y < -200 || this.y > canvasHeight + 200) {
                this.markedForDeletion = true;
            }
        } 
        else if (player) {
            // Mouvement guidé
            let d = distance(this.x, this.y, player.x, player.y);
            if (d > 0) {
                let dx = (player.x - this.x) / d;
                let dy = (player.y - this.y) / d;
                
                this.vx = dx * this.speed;
                this.vy = dy * this.speed;

                this.x += this.vx;
                this.y += this.vy;
                
                this.angle = Math.atan2(dy, dx);
            }
        }
        
        if(this.type === 'fast') this.pulse += 0.5;
        else this.pulse += 0.1;
    }

    // --- NOUVELLE PHYSIQUE DE REBOND ---
    bounce(player) {
        let d = distance(this.x, this.y, player.x, player.y);
        
        if (d > 0) {
            // Vecteur Normal (Direction du choc)
            let nx = (this.x - player.x) / d;
            let ny = (this.y - player.y) / d;

            if (this.type === 'linear') {
                // CALCUL DE RÉFLEXION PHYSIQUE : R = V - 2(V.N)N
                // Produit scalaire (Dot Product)
                let dotProduct = (this.vx * nx) + (this.vy * ny);

                // On change le vecteur vitesse
                this.vx = this.vx - 2 * dotProduct * nx;
                this.vy = this.vy - 2 * dotProduct * ny;

                // On pousse un peu l'ennemi hors du bouclier pour éviter qu'il reste coincé
                this.x += nx * 5; 
                this.y += ny * 5;
            } 
            else {
                // Pour les ennemis guidés, on les repousse juste brutalement
                this.x += nx * 20;
                this.y += ny * 20;
            }
        }
    }

    hit() {
        this.hp--;
        if (this.hp <= 0) {
            this.markedForDeletion = true;
            return true; 
        }
        this.radius -= 2; 
        return false; 
    }

    draw(ctx, showDebug = false) {
        super.draw(ctx);

        if (showDebug) {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // Hitbox
            ctx.strokeStyle = "#00ff00";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Vecteur direction (Visible pour TOUS les types maintenant)
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.vx * 20, this.vy * 20); // Multiplicateur visuel
            ctx.stroke();

            ctx.fillStyle = "white";
            ctx.font = "12px monospace";
            ctx.fillText(`HP:${this.hp}`, -10, -this.radius - 8);

            ctx.restore();
        }
    }

    drawShape(ctx) {
        let scale = 1 + Math.sin(this.pulse) * 0.1;
        ctx.scale(scale, scale);
        ctx.fillStyle = this.color;
        
        if (this.type === 'linear') {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(Math.cos((i * 4 * Math.PI) / 5) * this.radius, 
                           Math.sin((i * 4 * Math.PI) / 5) * this.radius);
            }
            ctx.closePath();
            ctx.fill();
        }
        else if (this.type === 'tank') {
            ctx.fillRect(-this.radius, -this.radius, this.radius*2, this.radius*2);
        } else if (this.type === 'fast') {
            ctx.beginPath();
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(-this.radius, this.radius/2);
            ctx.lineTo(-this.radius, -this.radius/2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(-this.radius, this.radius);
            ctx.lineTo(-this.radius, -this.radius);
            ctx.fill();
        }
    }
}