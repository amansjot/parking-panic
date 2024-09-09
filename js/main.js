$(function(){
    const forwardSpeed = 5; // Forward movement speed
    const reverseSpeed = 3; // Reverse movement speed
    const rotationSpeed = 5; // Rotation speed in degrees
    let posX = 200; // Initial X position
    let posY = 200; // Initial Y position
    let angle = 0; // Initial angle (0 degrees facing up)

    // Track key states
    const keys = {
        w: false,
        a: false,
        s: false,
        d: false
    };

    // Handle key down events
    $(document).on('keydown', handleKeyDown);
    
    // Handle key up events
    $(document).on('keyup', handleKeyUp);

    // Main update loop
    setInterval(updateCar, 20); // 50 frames per second

    // Functions
    function handleKeyDown(e) {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true; // Mark the key as pressed
        }
    }

    function handleKeyUp(e) {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false; // Mark the key as released
        }
    }

    function updateCar() {
        if (keys.w || keys.s) {
            moveCar();
        }
        if (keys.w || keys.s) {
            rotateCar();
        }
        updateCarCSS();
    }

    function moveCar() {
        if (keys.w) {
            posX += forwardSpeed * Math.cos(degreesToRadians(angle - 90));
            posY += forwardSpeed * Math.sin(degreesToRadians(angle - 90));
        } 
        if (keys.s) {
            posX -= reverseSpeed * Math.cos(degreesToRadians(angle - 90));
            posY -= reverseSpeed * Math.sin(degreesToRadians(angle - 90));
        }
    }

    function rotateCar() {
        if (keys.a) {
            angle -= rotationSpeed; // Rotate counterclockwise
        }
        if (keys.d) {
            angle += rotationSpeed; // Rotate clockwise
        }
    }

    function updateCarCSS() {
        let car = $('#car');
        car.css({
            top: `${posY}px`,
            left: `${posX}px`,
            transform: `rotate(${angle}deg)`
        });
    }

    // Utility function to convert degrees to radians
    function degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
});