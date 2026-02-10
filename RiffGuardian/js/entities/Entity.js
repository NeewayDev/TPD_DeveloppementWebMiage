export default class Entity {
    constructor(x, y, speed, color, radius) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = speed;
        this.color = color;
        this.radius = radius;
        this.markedForDeletion = false;
    }

    // Méthode de dessin générique qui prépare le contexte
    // C'est ici qu'on respecte la consigne "Dessiner en 0,0"
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        this.drawShape(ctx); // Appel à la méthode spécifique de l'enfant
        
        ctx.restore();
    }

    drawShape(ctx) {
        // Par défaut un cercle si l'enfant ne définit rien
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, 2*Math.PI);
        ctx.fill();
    }

    update() {
        // A surcharger
    }
}