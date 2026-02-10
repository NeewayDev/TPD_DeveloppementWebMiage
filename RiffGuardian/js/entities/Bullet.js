import Entity from './Entity.js';

export default class Bullet extends Entity {
    constructor(x, y, angle) {
        super(x, y, 10, "#FFFF00", 5);
        this.angle = angle;
    }

    update(canvasWidth, canvasHeight) {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);

        // Suppression si hors écran
        if(this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
            this.markedForDeletion = true;
        }
    }

    drawShape(ctx) {
        // Dessine une petite note de musique (double croche simplifiée)
        ctx.fillStyle = this.color;
        // La boule de la note
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        // La queue de la note
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(4, -10);
        ctx.lineTo(8, -5);
        ctx.stroke();
    }
}