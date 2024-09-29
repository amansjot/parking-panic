// Player data
let playerData = {
    // Starting Positioning & Dimensions
    x: 240,
    y: 900,
    angle: 0,
    width: 35,
    height: 70,

    // Speed & Movement
    maxForwardSpeed: 2,
    maxReverseSpeed: 1.5,
    acceleration: 0.1,
    deceleration: 0.1,
    rotationSpeed: 2,
    currentSpeed: 0,
    
    // Extra Features
    headlightsOn: false
};

// Moves the car forward or backward based on input keys (W, S, Arrow keys).
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

    // Calculate new position based on speed and angle.
    const newX = playerData.x + playerData.currentSpeed * Math.cos(degreesToRadians(playerData.angle - 90));
    const newY = playerData.y + playerData.currentSpeed * Math.sin(degreesToRadians(playerData.angle - 90));

    // Constrain the player within the game window
    playerData.x = Math.max(0, Math.min(newX, 1000 - playerData.width));
    playerData.y = Math.max(0, Math.min(newY, 1000 - playerData.height));

    // Check if the car is inside the mode selection buttons.
    checkContainmentButtons();
}

// Rotates the car left or right based on input keys (A, D, Arrow keys) when the car is moving.
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

// Stops the car by setting the maximum speed to zero after a short delay.
function stopCar(keys) {
    setTimeout(function() {
        playerData.maxForwardSpeed = 0;
        playerData.maxReverseSpeed = 0;
    }, 50);
}

// Resets the car to its starting position and speed based on the selected game mode (easy or hard).
function resetCar(mode) {
    playerData.currentSpeed = 0;
    playerData.x = 240;
    playerData.y = 900;
    playerData.angle = 0;
    if (mode == "easy-mode") {
        playerData.maxForwardSpeed = 2;
        playerData.maxReverseSpeed = 1.5;
    } else if (mode == "hard-mode") {
        playerData.maxForwardSpeed = 3;
        playerData.maxReverseSpeed = 2;
    }
}

// Checks if the car is fully contained within the easy-mode or hard-mode button areas.
function checkContainmentButtons() {
    const easyModeButton = document.getElementById('easy-mode-button');
    const easyModeRect = easyModeButton.getBoundingClientRect();

    const hardModeButton = document.getElementById('hard-mode-button');
    const hardModeRect = hardModeButton.getBoundingClientRect();

    const car = document.getElementById("car");
    const carRect = car.getBoundingClientRect();

    // Check if the car is fully contained within the mode buttons
    if (
        carRect.left >= easyModeRect.left &&
        carRect.right <= easyModeRect.right &&
        carRect.top >= easyModeRect.top &&
        carRect.bottom <= easyModeRect.bottom
    ) {
        return "easy-mode";
    }

    if (
        carRect.left >= hardModeRect.left &&
        carRect.right <= hardModeRect.right &&
        carRect.top >= hardModeRect.top &&
        carRect.bottom <= hardModeRect.bottom
    ) {
        return "hard-mode";
    }

    return false;
}

// Updates the car's CSS to reflect its current position and rotation angle in the game.
function updatePlayerCSS(player) {
    player.css({
        top: `${playerData.y}px`,
        left: `${playerData.x}px`,
        transform: `rotate(${playerData.angle}deg)`
    });
}

// Toggles the car's headlights on and off.
function toggleHeadlights(headlights) {
    playerData.headlightsOn = !playerData.headlightsOn;

    if (playerData.headlightsOn) {
        headlights.show();
    } else {
        headlights.hide();
    }
}

// Converts an angle from degrees to radians.
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export { playerData, moveCar, rotateCar, stopCar, resetCar, checkContainmentButtons, updatePlayerCSS, toggleHeadlights };