import { getMousePos } from './utils.js';

export default class InputListeners {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouse = { x: 0, y: 0, leftClick: false };

        this.initListeners();
    }

    initListeners() {
        // Clavier
        window.addEventListener('keydown', (evt) => {
            // Si c'est Espace ou les Flèches, on empêche le navigateur de scroller
            if(evt.key === " " || evt.key === "ArrowUp" || evt.key === "ArrowDown") {
                evt.preventDefault();
            }
            
            this.keys[evt.key] = true;
        });

        window.addEventListener('keyup', (evt) => {
            this.keys[evt.key] = false;
        });

        // Souris
        this.canvas.addEventListener('mousemove', (evt) => {
            let pos = getMousePos(this.canvas, evt);
            this.mouse.x = pos.x;
            this.mouse.y = pos.y;
        });

        this.canvas.addEventListener('mousedown', () => {
            this.mouse.leftClick = true;
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouse.leftClick = false;
        });
    }
}