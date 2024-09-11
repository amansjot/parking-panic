$(function(){
    // Variables for speed and movement
    let currentSpeed = 0;          // Car's current speed (starts at 0)
    const maxForwardSpeed = 10;    // Max speed for moving forward
    const maxReverseSpeed = 5;     // Max speed for moving backward
    const acceleration = 0.3;      // How fast the car accelerates
    const deceleration = 0.2;      // How fast the car slows down when no key is pressed
    const rotationSpeed = 5;       // How fast the car rotates

    // Initial car position and rotation
    let posX = 200;                // Initial X position
    let posY = 200;                // Initial Y position
    let angle = 0;                 // Initial rotation (0 degrees, facing up)

    // Track key states
    const keys = {
        w: false,  // Forward
        a: false,  // Left 
        s: false,  // Backward
        d: false   // Right 
    };

    // Event listeners for key press and release
    $(document).on('keydown', handleKeyDown);  // Trigger when a key is pressed
    $(document).on('keyup', handleKeyUp);      // Trigger when a key is released

    // Main update loop: Runs 50 times per second (every 20ms)
    setInterval(updateCar, 20);

    // Function to handle when a key is pressed
    function handleKeyDown(e) {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true; // Mark the key as pressed
        }
    }

    // Function to handle when a key is released
    function handleKeyUp(e) {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false; // Mark the key as released
        }
    }

    // This function updates the car's movement and rotation
    function updateCar() {
        moveCar();
        rotateCar();  
        updateCarCSS();
    }

    // Function to handle car movement (forward, backward)
    function moveCar() {
        if (keys.w) {  // If 'w' is pressed, accelerate forward
            currentSpeed = Math.min(currentSpeed + acceleration, maxForwardSpeed);
        } 
        else if (keys.s) {  // If 's' is pressed, accelerate backward
            currentSpeed = Math.max(currentSpeed - acceleration, -maxReverseSpeed);
        } 
        else {  // If no key is pressed, gradually slow down (decelerate)
            if (currentSpeed > 0) {
                currentSpeed = Math.max(currentSpeed - deceleration, 0);
            } 
            else if (currentSpeed < 0) {
                currentSpeed = Math.min(currentSpeed + deceleration, 0);
            }
        }

        // Update the car's position based on current speed and direction (angle)
        posX += currentSpeed * Math.cos(degreesToRadians(angle - 90));
        posY += currentSpeed * Math.sin(degreesToRadians(angle - 90));
    }

    // Function to handle car rotation (turning left or right)
    function rotateCar() {
        if (currentSpeed !== 0) {  // Only rotate if the car is moving
            
            // Scale rotation speed based on the current speed
            let speedFactor = Math.abs(currentSpeed) / maxForwardSpeed; // Ranges from 0 to 1
            let scaledRotationSpeed = rotationSpeed * speedFactor; // Scale rotation speed based on speed

            if (keys.a) {  // If 'a' is pressed, rotate left (counterclockwise)
                angle -= scaledRotationSpeed;
            }
            if (keys.d) {  // If 'd' is pressed, rotate right (clockwise)
                angle += scaledRotationSpeed;
            }
        }
    }

    // Function to update the car's position and rotation in the HTML (CSS)
    function updateCarCSS() {
        let car = $('#car');
        car.css({
            top: `${posY}px`,                   // Move car vertically
            left: `${posX}px`,                  // Move car horizontally
            transform: `rotate(${angle}deg)`    // Rotate the car to match its angle
        });
    }

    // Utility function: Converts degrees to radians (needed for trigonometry)
    function degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
});