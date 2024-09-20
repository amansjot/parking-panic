// Player data
let playerData = {
    // Starting Positioning & Dimensions
    x: 23.4375, // 375 / 1600 * 100
    y: 27.7778, // 250 / 900 * 100
    angle: 0,
    width: 3.125, // 50 / 1600 * 100
    height: 11.1111, // 100 / 900 * 100
 
 
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
 
 
    const gameContainer = document.getElementById('game-container');
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight;
 
 
    // Update the car's position based on current speed and direction (angle)
    playerData.x += playerData.currentSpeed * Math.cos(degreesToRadians(playerData.angle - 90));
    playerData.y += playerData.currentSpeed * Math.sin(degreesToRadians(playerData.angle - 90));
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
    const gameContainer = document.getElementById('game-container');
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight;
 
 
    player.css({
        top: `${(playerData.y / containerHeight) * 100}%`,
        left: `${(playerData.x / containerWidth) * 100}%`,
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