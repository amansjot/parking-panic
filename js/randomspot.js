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
    spotDiv.style.animation = "glow-red 1s infinite alternate";
    return spotId;
}

const missionCompleteMessage = $('#mission-complete-message');

function triggerConfetti() {
    const confetti = document.getElementById("car-confetti");
    confetti.style.display = "block"; // Show the confetti gif

    // Hide the confetti after some time
    setTimeout(() => {
        confetti.style.display = "none"; // Hide the confetti gif
    }, 400);
}

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
        //missionCompleteMessage.show(); // Show mission complete message
        //stopTimer();
        ///*
        spotDiv.style.boxShadow = "0 0 15px 10px rgba(0, 255, 0, 0.7)";
        spotDiv.style.transition = "box-shadow 0.3s ease-in-out";
        //console.log("post glow");
        //*/
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
    spotDiv.style.animation = "";
    // triggerConfetti();
}

export { initializeParkingSpots, triggerConfetti, updateSpot, randomSpot, checkParkingCompletion, revertParkingSpot };