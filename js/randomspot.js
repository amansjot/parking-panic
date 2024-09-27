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

    function updateSpot(){//Take a random number, associates it with a spot, and adjusts the spots css to glow 
        //const spotNum = randomSpot(); 
        //const spotId = spots[spotNum];//Gets id value for it's div 
        console.log(spotId); 
        const spotDiv = document.getElementById(spotId); 
        console.log(spotDiv); 
        spotDiv.style.border= "3px dashed yellow";
        spotDiv.style.zIndex="3"; 
        spotDiv.style.backgroundColor= "rgba(255, 255, 0, 0.1)";
    }



    function checkParkingCompletion() {

        
        
    }
    
    export {updateSpot, randomSpot}