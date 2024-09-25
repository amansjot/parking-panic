// gamestate.js

let gameActive = true;

function setGameActive(active) {
    gameActive = active;
}

function isGameActive() {
    return gameActive;
}

export { setGameActive, isGameActive };