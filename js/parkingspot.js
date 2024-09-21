//parkingspot.js
import { stopTimer } from './timer.js';
import { playerData } from './movement.js';
import { calculateOBB } from './collision.js';

// Parking spot and messages
const parkingSpot = $('#parking-spot');
const missionCompleteMessage = $('#mission-complete-message');

function checkParkingCompletion() {
    const parkingSpotRect = parkingSpot[0].getBoundingClientRect();
    const playerCorners = calculateOBB(playerData);

    const carFullyInSpot = isCarCompletelyInSpot(playerCorners, parkingSpotRect);

    if (carFullyInSpot) {
        missionCompleteMessage.show(); // Show mission complete message
        stopTimer();
        parkingSpot.addClass('glow'); // Add the glow effect to the parking spot
    } else {
        missionCompleteMessage.hide(); // Hide message if not fully parked
        parkingSpot.removeClass('glow'); // Remove the glow effect if not parked
    }
}       

function isCarCompletelyInSpot(carCorners, spotRect) {
    // Check if all corners of the car are within the parking spot
    return carCorners.every(corner =>
        corner.x >= spotRect.left &&
        corner.x <= spotRect.right &&
        corner.y >= spotRect.top &&
        corner.y <= spotRect.bottom
    );
}    

export { checkParkingCompletion };
