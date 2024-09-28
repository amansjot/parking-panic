
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

    function randomSpot(){ //Gets the random spot number
        const num = Math.floor((Math.random() * 49) + 1);
        return num;
    }
    
    let spotNum = randomSpot(); //global constant for the parkingspot in the round
    let spotId = spots[spotNum]; //Gets id value for it's div 
    //let spotDiv = document.getElementById(spotId); //getting the correct parking div

    function updateSpot(){//Take a random number, associates it with a spot, and adjusts the spots css to glow 
        const spotDiv = document.getElementById(spotId);  
        spotDiv.style.border= "3px dashed yellow";
        spotDiv.style.zIndex="3"; 
        spotDiv.style.backgroundColor= "rgba(255, 255, 0, 0.1)";
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
            missionCompleteMessage.show(); // Show mission complete message
            //stopTimer();
            spotDiv.style.boxShadow="0 0 15px 10px rgba(0, 255, 0, 0.7)";
            spotDiv.style.transition= "box-shadow 0.3s ease-in-out";
            return true;
        }
        else{
            return false;
        }  
    }
    
    function revertParkingSpot(){ //Removes outline and glow after round is done
        const spotDiv = document.getElementById(spotId); 
        spotDiv.style.border= "";
        spotDiv.style.zIndex="2"; 
        spotDiv.style.backgroundColor= "";
        spotDiv.style.boxShadow="";
        spotDiv.style.transition= "";
    }

    export {updateSpot, randomSpot, checkParkingCompletion, revertParkingSpot};