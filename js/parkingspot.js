//parkingspot.js
import { stopTimer } from './timer.js';
import { playerData, stopCarMovement } from './movement.js';
import { calculateOBB } from './collision.js';

// Parking spot and messages
const parkingSpot = $('#parking-spot');
const missionCompleteMessage = $('#mission-complete-message');

/**
 * Checks if the car has been parked correctly by determining
 * if all corners of the car are fully within the parking spot.
 * If the car is parked, it shows the mission complete message,
 * stops the timer and car movement, and calls setGameInactive.
 * If the car isn't parked, it hides the message and removes the glow.
 */
function checkParkingCompletion() {
    const parkingSpotRect = parkingSpot[0].getBoundingClientRect();
    const playerCorners = calculateOBB(playerData);

    const carFullyInSpot = isCarCompletelyInSpot(playerCorners, parkingSpotRect);

    if (carFullyInSpot) {
        missionCompleteMessage.show(); 
        stopTimer();
        parkingSpot.addClass('glow'); 
        stopCarMovement();
        setGameInactive();
    } else {
        missionCompleteMessage.hide();
        parkingSpot.removeClass('glow');
    }
}       

/**
 * Determines if all corners of the car are within the boundaries of the parking spot.
 * Returns true if the car is completely inside the parking spot, otherwise false.
 * @param {Array} carCorners - The corners of the car's bounding box.
 * @param {DOMRect} spotRect - The dimensions of the parking spot.
 */
function isCarCompletelyInSpot(carCorners, spotRect) {
    // Check if all corners of the car are within the parking spot
    return carCorners.every(corner =>
        corner.x >= spotRect.left &&
        corner.x <= spotRect.right &&
        corner.y >= spotRect.top &&
        corner.y <= spotRect.bottom
    );
}

// Reset the parking spot file
function resetParkingFile() {
    missionCompleteMessage.hide(); 
    parkingSpot.removeClass('glow'); 
}

export { checkParkingCompletion, resetParkingFile };
