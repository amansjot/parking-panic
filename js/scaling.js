function scaleGame() {
    const gameContainer = document.getElementById('game-container');
    const scaler = document.getElementById('game-scaler');
    const aspectRatio = gameContainer.offsetWidth / gameContainer.offsetHeight;

    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;

    if (newWidth / newHeight > aspectRatio) {
        newWidth = newHeight * aspectRatio;
    } else {
        newHeight = newWidth / aspectRatio;
    }

    const scale = Math.min(newWidth / gameContainer.offsetWidth, newHeight / gameContainer.offsetHeight);

    scaler.style.width = `${newWidth}px`;
    scaler.style.height = `${newHeight}px`;
    gameContainer.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', scaleGame);
window.addEventListener('load', scaleGame);

export { scaleGame };