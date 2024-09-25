import { isGameActive, setGameActive } from './gamestate.js';

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

// Moves the car based on key presses and updates its position and speed
function moveCar(keys, startTimer) {
    if (!isGameActive()) return;
    if (keys.w || keys.ArrowUp) {  // If 'w' or up arrow is pressed, accelerate forward
        startTimer();
        playerData.currentSpeed = Math.min(playerData.currentSpeed + playerData.acceleration, playerData.maxForwardSpeed);
    } 
    else if (keys.s || keys.ArrowDown) {  // If 's' or down arrow is pressed, accelerate backward
        startTimer();
        playerData.currentSpeed = Math.max(playerData.currentSpeed - playerData.acceleration, -playerData.maxReverseSpeed);
    } 
    else {  // If no key is pressed, gradually slow down (decelerate)
        if (playerData.currentSpeed > 0) {
            playerData.currentSpeed = Math.max(playerData.currentSpeed - playerData.deceleration, 0);
        } 
        else if (playerData.currentSpeed < 0) {
            playerData.currentSpeed = Math.min(playerData.currentSpeed + playerData.deceleration, 0);
        }
    }

    // Update the car's position based on current speed and direction (angle)
    let newX = playerData.x += playerData.currentSpeed * Math.cos(degreesToRadians(playerData.angle - 90));
    let newY = playerData.y += playerData.currentSpeed * Math.sin(degreesToRadians(playerData.angle - 90));

    // Everything below is boundry stuff:
    
    // Get the container boundaries
    const containerWidth = $('#container').width();
    const containerHeight = $('#container').height();

    const carWidth = playerData.width;
    const carHeight = playerData.height;

    // Check horizontal boundaries (prevent the car from going off the left and right edges)
    if (newX < 0) newX = 0;  // Prevent car from going past the left edge
    if (newX + carWidth > containerWidth) newX = containerWidth - carWidth;  // Prevent car from going past the right edge

    // Check vertical boundaries (prevent the car from going off the top and bottom edges)
    if (newY < 0) newY = 0;  // Prevent car from going past the top edge
    if (newY + carHeight > containerHeight) newY = containerHeight - carHeight;  // Prevent car from going past the bottom edge

    // Update player data with the new position
    playerData.x = newX;
    playerData.y = newY;
}

// Stops the car's movement by setting the game state to inactive
function stopCarMovement() {
    setGameActive(false); // Disable game active status to stop car movement
}

// Rotates the car left or right based on key presses
function rotateCar(keys) {
    if (!isGameActive()) return;
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

// Updates the car's CSS position and rotation on the screen
function updatePlayerCSS(player) {
    player.css({
        top: `${playerData.y}px`,
        left: `${playerData.x}px`,
        transform: `rotate(${playerData.angle}deg)`
    });
}

// Toggles the car's headlights on and off
function toggleHeadlights(headlights) {
    playerData.headlightsOn = !playerData.headlightsOn;

    if (playerData.headlightsOn) {
        headlights.show();
    } else {
        headlights.hide();
    }
}

// Converts degrees to radians for rotation calculations
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Resets the car's position, angle, and speed to its initial state
function resetCarPosition() {
    playerData.x = 200;
    playerData.y = 200;
    playerData.angle = 0;
    playerData.currentSpeed = 0;
}

export { playerData, moveCar, rotateCar, updatePlayerCSS, toggleHeadlights, stopCarMovement, resetCarPosition };