

function initializeParkingSpots() {
    for (let i = 1; i <= 49; i++) {
        $("#scroll-window").append(`<div class="spot parking-spot" id="spot-${i}"></div>`);
    }
}


function randomSpot() { //Gets the random spot number
    const num = Math.floor((Math.random() * 49) + 1);
    return num;
}

let spotNum = randomSpot(); //global constant for the parkingspot in the round
let spotId = `spot-${spotNum}`; //Gets id value for it's div 
//let spotDiv = document.getElementById(spotId); //getting the correct parking div

function updateSpot() {//Take a random number, associates it with a spot, and adjusts the spots css to glow 

    // Reassign a new spot number and spot ID for each round
    spotNum = randomSpot(); // Generate a new random spot number
    spotId = `spot-${spotNum}`; // Update the spotId to match the new spot number

    const spotDiv = document.getElementById(spotId);
    spotDiv.style.border = "3px dashed yellow";
    spotDiv.style.zIndex = "3";
    spotDiv.style.backgroundColor = "rgba(255, 255, 0, 0.1)";

    return spotId;
}

/*
function isCarCompletelyInSpot(carCorners, spotRect) {
    // Check if all corners of the car are within the parking spot
    return carCorners.every(corner =>
        corner.x >= spotRect.left &&
        corner.x <= spotRect.right &&
        corner.y >= spotRect.top &&
        corner.y <= spotRect.bottom
    );
}  
*/

const missionCompleteMessage = $('#mission-complete-message');

function checkParkingCompletion() {
    //Getting Parking spot location
    const spotDiv = document.getElementById(spotId);
    const spotRect = spotDiv.getBoundingClientRect();

    // Get the car's position and dimensions
    const car = document.getElementById("car");
    const carRect = car.getBoundingClientRect();

    if (
        carRect.left >= spotRect.left &&
        carRect.right <= spotRect.right &&
        carRect.top >= spotRect.top &&
        carRect.bottom <= spotRect.bottom
    ) {
        missionCompleteMessage.show(); // Show mission complete message
        //stopTimer();
        spotDiv.style.boxShadow = "0 0 15px 10px rgba(0, 255, 0, 0.7)";
        spotDiv.style.transition = "box-shadow 0.3s ease-in-out";
        return true;
    }
    else {
        return false;
    }
}

function revertParkingSpot() { //Removes outline and glow after round is done
    const spotDiv = document.getElementById(spotId);
    spotDiv.style.border = "";
    spotDiv.style.zIndex = "2";
    spotDiv.style.backgroundColor = "";
    spotDiv.style.boxShadow = "";
    spotDiv.style.transition = "";
}

export { initializeParkingSpots, updateSpot, randomSpot, checkParkingCompletion, revertParkingSpot };