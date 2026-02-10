// Fonctions utilitaires génériques
export function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

// Fonction pour limiter une valeur entre min et max (clamp)
export function clamp(val, min, max) {
    return val > max ? max : val < min ? min : val;
}