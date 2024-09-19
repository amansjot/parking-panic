// Player data
let playerData = {
    // Starting Positioning & Dimensions
    x: 200,
    y: 200,
    angle: 0,
    width: 50,
    height: 100,

    // Speed & Movement
    maxForwardSpeed: 3, // 5
    maxReverseSpeed: 2, // 3
    acceleration: 0.3,
    deceleration: 0.2,
    rotationSpeed: 2, // 3
    currentSpeed: 0,
    angle: 90,

    // Extra Features
    headlightsOn: false
};

function moveCar(keys) {
    if (keys.w) {  // If 'w' is pressed, accelerate forward
        playerData.currentSpeed = Math.min(playerData.currentSpeed + playerData.acceleration, playerData.maxForwardSpeed);
    }
    else if (keys.s) {  // If 's' is pressed, accelerate backward
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
    let newX = playerData.x + playerData.currentSpeed * Math.cos(degreesToRadians(playerData.angle - 90));
    let newY = playerData.y + playerData.currentSpeed * Math.sin(degreesToRadians(playerData.angle - 90));

    // Ensure the car stays within the bounds of the container
    const container = $('#parkingButtons')[0]; // Get the DOM element
    const rect = container.getBoundingClientRect(); // Get bounding rect from the DOM element

    const carWidth = playerData.width;
    const carHeight = playerData.height;

    // Calculate the actual visible area taking into account the centered positioning
    const visibleLeft = rect.left - 265 - 5;
    const visibleRight = rect.right - 315 + 5;
    const visibleTop = rect.top - 20 - 5;
    const visibleBottom = rect.bottom - 20 + 5;

    // Check horizontal boundaries
    if (newX < visibleLeft) {
        newX = visibleLeft; // Snap to the left boundary
    }
    if (newX + carWidth > visibleRight) {
        newX = visibleRight - carWidth; // Snap to the right boundary
    }

    // Check vertical boundaries
    if (newY < visibleTop) {
        newY = visibleTop; // Snap to the top boundary
    }
    if (newY + carHeight > visibleBottom) {
        newY = visibleBottom - carHeight; // Snap to the bottom boundary
    }

    // Update player data with the new position
    playerData.x = newX;
    playerData.y = newY;

}

function rotateCar(keys) {
    if (playerData.currentSpeed !== 0) {  // Only rotate if the car is moving
        // Scale rotation speed based on the current speed
        let speedFactor = Math.abs(playerData.currentSpeed) / playerData.maxForwardSpeed; // Ranges from 0 to 1
        let scaledRotationSpeed = playerData.rotationSpeed * speedFactor; // Scale rotation speed based on speed

        if (keys.a) {  // If 'a' is pressed, rotate left (counterclockwise)
            playerData.angle -= scaledRotationSpeed;
        }
        if (keys.d) {  // If 'd' is pressed, rotate right (clockwise)
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