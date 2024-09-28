//parkingspot.js
/*
import { stopTimer } from './timer.js';
import { playerData } from './movement.js';
import { calculateOBB } from './collision.js';

let currentParkingSpot;

// Parking spot and messages
//const parkingSpot = $('#parking-spot');


const parkingSpots = {
        1: $('#one'),
        2: $('#two'),
        3: $('#three'),
        4: $('#four'),
        5: $('#five'),
        6: $('#six'),
        7: $('#seven'),
        8: $('#eight'),
        9: $('#nine'),
        10: $('#ten'),
        11: $('#eleven'),
        12: $('#twelve'),
        13: $('#thirteen'),
        14: $('#fourteen'),
        15: $('#fifteen'),
        16: $('#sixteen'),
        17: $('#seventeen'),
        18: $('#eighteen'),
        19: $('#nineteen'),
        20: $('#twenty'),
        21: $('#twenty-one'),
        22: $('#twenty-two'),
        23: $('#twenty-three'),
        24: $('#twenty-four'),
        25: $('#twenty-five'),
        26: $('#twenty-six'),
        27: $('#twenty-seven'),
        28: $('#twenty-eight'),
        29: $('#twenty-nine'),
        30: $('#thirty'),
        31: $('#thirty-one'),
        32: $('#thirty-two'),
        33: $('#thirty-three'),
        34: $('#thirty-four'),
        35: $('#thirty-five'),
        36: $('#thirty-six'),
        37: $('#thirty-seven'),
        38: $('#thirty-eight'),
        39: $('#thirty-nine'),
        40: $('#fourty'),
        41: $('#fourty-one'),
        42: $('#fourty-two'),
        43: $('#fourty-three'),
        44: $('#fourty-four'),
        45: $('#fourty-five'),
        46: $('#fourty-six'),
        47: $('#fourty-seven'),
        48: $('#fourty-eight'),
        49: $('#fourty-nine')
};

function setRandomParkingSpot() {
    const spotKeys = Object.keys(parkingSpots);
    const randomIndex = Math.floor(Math.random() * spotKeys.length);
    console.log(randomIndex);
    currentParkingSpot = parkingSpots[spotKeys[randomIndex]];  // Select random parking spot
    console.log(currentParkingSpot);
}

function setCurrentParkingSpot() {
    // Remove any previous parking spot styling
    $('.parking-spot').removeClass('glow').css({
        border: "",
        zIndex: "",
        backgroundColor: ""
    });

    // Apply the CSS styling to the newly selected parking spot
    currentParkingSpot.css({
        border: "3px dashed yellow",
        zIndex: "3",
        backgroundColor: "rgba(255, 255, 0, 0.1)"
    });
}


function checkParkingCompletion() {
    const parkingSpotRect = currentParkingSpot[0].getBoundingClientRect();
    const playerCorners = calculateOBB(playerData);
    const carFullyInSpot = isCarCompletelyInSpot(playerCorners, parkingSpotRect);
    if (carFullyInSpot) {
        missionCompleteMessage.show(); // Show mission complete message
        stopTimer();
        currentParkingSpot.addClass('glow'); // Add the glow effect to the parking spot
    } else {
        missionCompleteMessage.hide(); // Hide message if not fully parked
        currentParkingSpot.removeClass('glow'); // Remove the glow effect if not parked
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
export { checkParkingCompletion, setRandomParkingSpot, setCurrentParkingSpot };

*/

