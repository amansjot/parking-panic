import { checkCollisions, registerObstacle } from './collision.js';

// Player data object
let playerData = {
    x: 200,
    y: 200,
    angle: 0,
    width: 50,
    height: 100,
    maxForwardSpeed: 5,
    maxReverseSpeed: 3,
    acceleration: 0.3,
    deceleration: 0.2,
    rotationSpeed: 3,
    currentSpeed: 0,
    headlightsOn: false
};

// Register obstacles by selecting their hitbox and element
const coneHitbox = $('#cone-hitbox');
const coneElement = $('#cone-obstacle');

const dumpsterHitbox = $('#dumpster-hitbox');
const dumpsterElement = $('#dumpster-obstacle');

registerObstacle(coneHitbox, coneElement);
registerObstacle(dumpsterHitbox, dumpsterElement);

function moveCar(keys, startTimer) {
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

    // Calculate the new potential position
    let newX = playerData.x + playerData.currentSpeed * Math.cos(degreesToRadians(playerData.angle - 90));
    let newY = playerData.y + playerData.currentSpeed * Math.sin(degreesToRadians(playerData.angle - 90));

    // Check for collisions before updating the car's position
    const playerDataForCollision = {
        x: newX,
        y: newY,
        width: playerData.width,
        height: playerData.height,
        angle: playerData.angle
    };

    const collisionDetected = checkCollisions(playerDataForCollision);

    // If no collision, update the player's position
    if (!collisionDetected) {
        playerData.x = newX;
        playerData.y = newY;
    }

    // Boundary checks to prevent the car from leaving the container
    const containerWidth = $('#container').width();
    const containerHeight = $('#container').height();
    const carWidth = playerData.width;
    const carHeight = playerData.height;

    if (playerData.x < 0) playerData.x = 0;  // Prevent car from going past the left edge
    if (playerData.x + carWidth > containerWidth) playerData.x = containerWidth - carWidth;  // Prevent car from going past the right edge
    if (playerData.y < 0) playerData.y = 0;  // Prevent car from going past the top edge
    if (playerData.y + carHeight > containerHeight) playerData.y = containerHeight - carHeight;  // Prevent car from going past the bottom edge
}

// Rotating the car
function rotateCar(keys) {
    if (playerData.currentSpeed !== 0) {  // Only rotate if the car is moving
        let speedFactor = Math.abs(playerData.currentSpeed) / playerData.maxForwardSpeed;  // Normalize speed
        let scaledRotationSpeed = playerData.rotationSpeed * speedFactor;

        if (keys.a || keys.ArrowLeft) {
            playerData.angle -= scaledRotationSpeed;
        }
        if (keys.d || keys.ArrowRight) {
            playerData.angle += scaledRotationSpeed;
        }
    }
}

// Update player position in CSS
function updatePlayerCSS(player) {
    player.css({
        top: `${playerData.y}px`,
        left: `${playerData.x}px`,
        transform: `rotate(${playerData.angle}deg)`
    });
}

// Toggle headlights function
function toggleHeadlights(headlights) {
    playerData.headlightsOn = !playerData.headlightsOn;

    if (playerData.headlightsOn) {
        headlights.show();
    } else {
        headlights.hide();
    }
}

// Helper function to convert degrees to radians
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export { playerData, rotateCar, updatePlayerCSS, toggleHeadlights };


 /** 
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

import { checkCollisions, registerObstacle } from './collision.js';

// Register obstacles by selecting their hitbox and element
const coneHitbox = $('#cone-hitbox');
const coneElement = $('#cone-obstacle');

const dumpsterHitbox = $('#dumpster-hitbox');
const dumpsterElement = $('#dumpster-obstacle');

// Register both cone and dumpster obstacles
registerObstacle(coneHitbox, coneElement);
registerObstacle(dumpsterHitbox, dumpsterElement);

document.addEventListener('keydown', function(event) {
    const carElement = $('#car');
    const carData = {
        x: carElement.offset().left,
        y: carElement.offset().top,
        width: carElement.width(),
        height: carElement.height(),
        angle: playerData.angle  // Use this if you have rotation
    };

    let moveSpeed = 5;  // Adjust this value to control movement speed
    let newTop = carElement.offset().top;
    let newLeft = carElement.offset().left;

    switch(event.key) {
        case 'ArrowUp':
        case 'w':
            newTop -= moveSpeed;
            break;
        case 'ArrowDown':
        case 's':
            newTop += moveSpeed;
            break;
        case 'ArrowLeft':
        case 'a':
            newLeft -= moveSpeed;
            break;
        case 'ArrowRight':
        case 'd':
            newLeft += moveSpeed;
            break;
    }

    // Prepare the new data for collision check
    const playerDataForCollision = {
        x: newLeft,
        y: newTop,
        width: carData.width,
        height: carData.height,
        angle: carData.angle
    };

    // Check for collisions with registered obstacles
    const collisionDetected = checkCollisions(playerDataForCollision);

    // If no collision, update the car's position
    if (!collisionDetected) {
        carElement.css({ top: `${newTop}px`, left: `${newLeft}px` });
    }
});

/**
function moveCar(keys, startTimer) {
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
**/

