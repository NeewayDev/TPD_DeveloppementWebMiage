import Game from './Game.js';

window.onload = () => {
    let canvas = document.querySelector("#myCanvas");
    let game = new Game(canvas);
    game.start();
};