// Player data
let playerData = {
    // Starting Positioning & Dimensions
    x: 200,
    y: 200,
    angle: 0,
    width: 50,
    height: 100,

    // Speed & Movement
    maxForwardSpeed: 5,
    maxReverseSpeed: 3,
    acceleration: 0.3,
    deceleration: 0.2,
    rotationSpeed: 3,
    currentSpeed: 0,
    angle: 0,
    
    // Extra Features
    headlightsOn: false
};

function moveCar(keys) {
    if (keys.w || keys.ArrowUp) {
        playerData.currentSpeed = Math.min(playerData.currentSpeed + playerData.acceleration, playerData.maxForwardSpeed);
    } 
    else if (keys.s || keys.ArrowDown) {
        playerData.currentSpeed = Math.max(playerData.currentSpeed - playerData.acceleration, -playerData.maxReverseSpeed);
    } 
    else {
        if (playerData.currentSpeed > 0) {
            playerData.currentSpeed = Math.max(playerData.currentSpeed - playerData.deceleration, 0);
        } 
        else if (playerData.currentSpeed < 0) {
            playerData.currentSpeed = Math.min(playerData.currentSpeed + playerData.deceleration, 0);
        }
    }

    const newX = playerData.x + playerData.currentSpeed * Math.cos(degreesToRadians(playerData.angle - 90));
    const newY = playerData.y + playerData.currentSpeed * Math.sin(degreesToRadians(playerData.angle - 90));

    // Constrain the player within the game window
    playerData.x = Math.max(0, Math.min(newX, 1000 - playerData.width));
    playerData.y = Math.max(0, Math.min(newY, 1000 - playerData.height));
}

function rotateCar(keys) {
    if (playerData.currentSpeed !== 0) {  // Only rotate if the car is moving
        // Scale rotation speed based on the current speed
        let speedFactor = Math.abs(playerData.currentSpeed) / playerData.maxForwardSpeed; // Ranges from 0 to 1
        let scaledRotationSpeed = playerData.rotationSpeed * speedFactor; // Scale rotation speed based on speed

        if (keys.a || keys.ArrowLeft) {  // If 'a' or left arrow is pressed, rotate left (counterclockwise)
            playerData.angle -= scaledRotationSpeed;
        }
        if (keys.d || keys.ArrowRight) {  // If 'd' or right arrow is pressed, rotate right (clockwise)
            playerData.angle += scaledRotationSpeed;
        }
    }
}

function updatePlayerCSS(player) {
    player.css({
        top: `${playerData.y}px`,
        left: `${playerData.x}px`,
        transform: `rotate(${playerData.angle}deg)`
    });
}

function toggleHeadlights(headlights) {
    playerData.headlightsOn = !playerData.headlightsOn;

    if (playerData.headlightsOn) {
        headlights.show();
    } else {
        headlights.hide();
    }
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export { playerData, moveCar, rotateCar, updatePlayerCSS, toggleHeadlights };