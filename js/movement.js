// Player data object containing car properties and state
let playerData = {
    // Starting Positioning & Dimensions
    x: 240,  // X-coordinate of the car
    y: 900,  // Y-coordinate of the car
    angle: 0,  // Rotation angle of the car
    width: 30,  // Width of the car
    height: 65, // Height of the car

    // Speed & Movement settings
    maxForwardSpeed: 2,  // Maximum forward speed
    maxReverseSpeed: 1.5,  // Maximum reverse speed
    acceleration: 0.1,  // Rate of acceleration
    deceleration: 0.1,  // Rate of deceleration
    rotationSpeed: 2,  // Speed of car rotation
    currentSpeed: 0,  // Current speed of the car
    
    // Extra Features
    headlightsOn: false  // State of headlights (on/off)
};

// Function to move the car based on key inputs
function moveCar(keys) {
    // Check forward or backward movement keys (W/S or Arrow keys)
    if (keys.w || keys.ArrowUp) {
        // Accelerate forward
        playerData.currentSpeed = Math.min(playerData.currentSpeed + playerData.acceleration, playerData.maxForwardSpeed);
    } 
    else if (keys.s || keys.ArrowDown) {
        // Accelerate backward
        playerData.currentSpeed = Math.max(playerData.currentSpeed - playerData.acceleration, -playerData.maxReverseSpeed);
    } 
    else {
        // Decelerate to stop if no movement keys are pressed
        if (playerData.currentSpeed > 0) {
            playerData.currentSpeed = Math.max(playerData.currentSpeed - playerData.deceleration, 0);
        } 
        else if (playerData.currentSpeed < 0) {
            playerData.currentSpeed = Math.min(playerData.currentSpeed + playerData.deceleration, 0);
        }
    }

    // Calculate new position based on speed and angle
    const newX = playerData.x + playerData.currentSpeed * Math.cos(degreesToRadians(playerData.angle - 90));
    const newY = playerData.y + playerData.currentSpeed * Math.sin(degreesToRadians(playerData.angle - 90));

    // Constrain the car's position within game window boundaries
    playerData.x = Math.max(0, Math.min(newX, 1000 - playerData.width));
    playerData.y = Math.max(0, Math.min(newY, 1000 - playerData.height));

    // Check if the player selects a mode (easy or hard)
    checkContainmentButtons();
}

// Function to rotate the car based on the current speed and keys pressed
function rotateCar(keys) {
    if (playerData.currentSpeed !== 0) {  // Rotate only when the car is moving
        // Scale rotation speed based on current speed
        let speedFactor = Math.abs(playerData.currentSpeed) / playerData.maxForwardSpeed;
        let scaledRotationSpeed = playerData.rotationSpeed * speedFactor;

        // Rotate left if 'a' or left arrow is pressed
        if (keys.a || keys.ArrowLeft) {
            playerData.angle -= scaledRotationSpeed;
        }
        // Rotate right if 'd' or right arrow is pressed
        if (keys.d || keys.ArrowRight) {
            playerData.angle += scaledRotationSpeed;
        }
    }
}

// Function to stop the car after a delay
function stopCar() {
    playerData.maxForwardSpeed = 0;
    playerData.maxReverseSpeed = 0;
}

// Function to reset the car to its starting position and speed for a given mode
function resetCar(mode) {
    // Set speeds based on selected mode (easy or hard)
    if (mode == "hard-mode") {
        playerData.maxForwardSpeed = 3;
        playerData.maxReverseSpeed = 2;
        playerData.rotationSpeed = 2.5;
    } else {
        playerData.maxForwardSpeed = 2;
        playerData.maxReverseSpeed = 1.5;
        playerData.rotationSpeed = 2;
    }

    playerData.currentSpeed = 0;
    playerData.x = 240;
    playerData.y = 900;
    playerData.angle = 0;
}

// Function to check if the car is contained within the start buttons
function checkContainmentButtons() {
    const easyModeButton = document.getElementById('easy-mode-button');
    const easyModeRect = easyModeButton.getBoundingClientRect();

    const hardModeButton = document.getElementById('hard-mode-button');
    const hardModeRect = hardModeButton.getBoundingClientRect();

    // Get the car's position and dimensions
    const car = document.getElementById("car");
    const carRect = car.getBoundingClientRect();

    // Check if the car is fully contained within the easy mode button
    if (
        carRect.left >= easyModeRect.left &&
        carRect.right <= easyModeRect.right &&
        carRect.top >= easyModeRect.top &&
        carRect.bottom <= easyModeRect.bottom
    ) {
        return "easy-mode";
    }

    // Check if the car is fully contained within the hard mode button
    if (
        carRect.left >= hardModeRect.left &&
        carRect.right <= hardModeRect.right &&
        carRect.top >= hardModeRect.top &&
        carRect.bottom <= hardModeRect.bottom
    ) {
        return "hard-mode";
    }

    return false;  // No mode selected
}

// Update the car's position and rotation in the CSS
function updatePlayerCSS(player) {
    player.css({
        top: `${playerData.y}px`,  // Update top position
        left: `${playerData.x}px`,  // Update left position
        transform: `rotate(${playerData.angle}deg)`  // Apply rotation
    });
}

// Toggle the car's headlights on or off
function toggleHeadlights(headlights) {
    playerData.headlightsOn = !playerData.headlightsOn;  // Toggle the state

    // Show or hide the headlights based on their state
    if (playerData.headlightsOn) {
        headlights.show();
    } else {
        headlights.hide();
    }
}

function playHorn() {
    const hornSound = document.getElementById('horn-sound');
    hornSound.currentTime = 0; // Reset the sound to the beginning
    hornSound.play(); // Play the horn sound
}

// Convert degrees to radians (for angle calculations)
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Export functions and player data for use in other modules
export { playerData, moveCar, rotateCar, stopCar, resetCar, checkContainmentButtons, updatePlayerCSS, toggleHeadlights, playHorn };
