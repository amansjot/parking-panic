
//Randomizing which parking spot gets chosen for round
const spots = {1:"one", 2:"two", 3:"three", 4:"four", 5:"five", 6:"six", 7:"seven",
    8:"eight", 9:"nine", 10: "ten", 11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen",
    15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen", 20: "twenty",
    21: "twenty-one", 22: "twenty-two", 23: "twenty-three", 24: "twenty-four", 25: "twenty-five",
    26: "twenty-six", 27: "twenty-seven", 28: "twenty-eight", 29: "twenty-nine", 30: "thirty", 31: "thirty-one",
    32: "thirty-two", 33: "thirty-three", 34: "thirty-four", 35: "thirty-five", 36: "thirty-six",
    37: "thirty-seven", 38: "thirty-eight", 39: "thirty-nine", 40: "fourty", 41: "fourty-one",  42: "fourty-two",
    43: "fourty-three", 44: "fourty-four", 45: "fourty-five", 46: "fourty-six", 47: "fourty-seven",
    48: "fourty-eight", 49: "fourty-nine"
    }

    // Function to generate a random parking spot number (between 1 and 49)
    function randomSpot(){ 
        const num = Math.floor((Math.random() * 49) + 1);
        return num;
    }
    
    let spotNum = randomSpot(); //global constant for the parkingspot in the round
    let spotId = spots[spotNum]; //Gets id value for it's div 

    // Function to update the chosen parking spot for the current round
    function updateSpot(){ 
        // Reassign a new spot number and spot ID for each round
        spotNum = randomSpot();
        spotId = spots[spotNum];

        const spotDiv = document.getElementById(spotId);  
        spotDiv.style.border= "3px dashed yellow";
        spotDiv.style.zIndex="3"; 
        spotDiv.style.backgroundColor= "rgba(255, 255, 0, 0.1)";
    }

    //const missionCompleteMessage = $('#mission-complete-message'); //not needed as of now

    // Function to check if the car has been successfully parked within the parking spot
    function checkParkingCompletion() {
        //Getting Parking spot location
        console.log("check parking");
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
        ){
            //missionCompleteMessage.show(); //not needed as of now
            //stopTimer(); //not needed as of now
            spotDiv.style.boxShadow="0 0 15px 10px rgba(0, 255, 0, 0.7)";
            spotDiv.style.transition= "box-shadow 0.3s ease-in-out";
            return true;
        }
        else{
            return false;
        }  
    }
    
    // Function to remove the parking spot's highlight and restore its default state after each round
    function revertParkingSpot(){ 
        const spotDiv = document.getElementById(spotId); 
        spotDiv.style.border= "";
        spotDiv.style.zIndex="2"; 
        spotDiv.style.backgroundColor= "";
        spotDiv.style.boxShadow="";
        spotDiv.style.transition= "";
    }

    export {updateSpot, randomSpot, checkParkingCompletion, revertParkingSpot};