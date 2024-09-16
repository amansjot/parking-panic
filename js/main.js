$(function () {
    // Player data
    let playerData = {

        // Starting Positioning & Dimensions
        x: 200,
        y: 200,
        angle: 0,
        width: 50,
        height: 100,

        // Speed & Movement
        maxForwardSpeed: 5,
        maxReverseSpeed: 3,
        acceleration: 0.3,
        deceleration: 0.2,
        rotationSpeed: 3,
        currentSpeed: 0,
        angle: 0,
        
        // Extra Features
        headlightsOn: false
    };

    // Timer & Game status
    let gameTimer = 30;
    let gameInterval = null;
    let gameActive = true;

    // Key states
    const keys = { w: false, s: false, a: false, d: false };

    // DOM elements
    const player = $('#car');
    const obstacle = $('#obstacle');
    const headlights = $('#headlights');
    const parkingSpot = $('#parking-spot');
    const missionCompleteMessage = $('#mission-complete-message');
    const missionFailedMessage = $('#mission-failed-message');
    const timerDisplay = $('#timer-display');

    // Handle key presses
    $(document).on('keydown', handleKeyDown);
    $(document).on('keyup', handleKeyUp);

    // Set initial state: Turn headlights off
    headlights.hide();

    // Initialize the game
    function startGame() {
        gameTimer = 30;
        gameActive = true;
        missionFailedMessage.hide();
        timerDisplay.text(gameTimer);

        gameInterval = setInterval(() => {
            gameTimer -= 1;
            timerDisplay.text(gameTimer);

            if (gameTimer <= 0 && !checkParkingCompletion()) {
                missionFailed();
            }
        }, 1000);

        setInterval(updatePlayer, 10);
    }

    // Start the game when the page loads
    startGame();

    function updatePlayer() {
        if (gameActive) {
            moveCar();
            rotateCar();
            updatePlayerCSS();
            checkCollisions();
            checkParkingCompletion();
        }
    }

    // Function to reset the game
    function resetGame() {
        playerData.x = 200;
        playerData.y = 200;
        playerData.angle = 0;
        playerData.currentSpeed = 0;
        updatePlayerCSS();
        missionCompleteMessage.hide();
        missionFailedMessage.hide();
        startGame(); 
    }

    // Start the timer when the player starts moving the car
    function startTimer() {
        if (!gameInterval) {
            gameInterval = setInterval(updateTimer, 1000);
        }
    }

    // Update the timer every second
    function updateTimer() {
        timeLeft -= 1;
        timerDisplay.text(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(gameInterval);
            gameInterval = null;
            timerDisplay.text("Time's up!");
        }
    }

    // Function to handle when the mission fails
    function missionFailed() {
        gameActive = false;
        missionFailedMessage.show();
        clearInterval(gameInterval);

        // Optionally reset game after a delay (e.g., 3 seconds)
        setTimeout(() => {
            resetGame();
        }, 3000); 
    }

    // Function to react when the player has successfully parked the car in the parking spot
    function checkParkingCompletion() {
        const parkingSpotRect = parkingSpot[0].getBoundingClientRect();
        const playerCorners = calculateOBB(playerData);

        const carFullyInSpot = isCarCompletelyInSpot(playerCorners, parkingSpotRect);

        if (carFullyInSpot) {
            missionCompleteMessage.show();
            parkingSpot.addClass('glow');
            clearInterval(gameInterval);
            gameActive = false;
        } else {
            missionCompleteMessage.hide();
            parkingSpot.removeClass('glow');
        }
    }

    // Function to check if the car is completely within the parking spot
    function isCarCompletelyInSpot(carCorners, spotRect) {
        // Check if all corners of the car are within the parking spot
        return carCorners.every(corner =>
            corner.x >= spotRect.left &&
            corner.x <= spotRect.right &&
            corner.y >= spotRect.top &&
            corner.y <= spotRect.bottom
        );
    }


    // Function to handle car movement (forward, backward)
    function moveCar() {
        if (keys.w) {  // If 'w' is pressed, accelerate forward
            startTimer();
            playerData.currentSpeed = Math.min(playerData.currentSpeed + playerData.acceleration, playerData.maxForwardSpeed);
        } 
        else if (keys.s) {  // If 's' is pressed, accelerate backward
            startTimer();
            playerData.currentSpeed = Math.max(playerData.currentSpeed - playerData.acceleration, -playerData.maxReverseSpeed);
        } 
        else {  // If no key is pressed, gradually slow down (decelerate)
            if (playerData.currentSpeed > 0) {
                playerData.currentSpeed = Math.max(playerData.currentSpeed - playerData.deceleration, 0);
            } 
            else if (playerData.currentSpeed < 0) {
                playerData.currentSpeed = Math.min(playerData.currentSpeed + playerData.deceleration, 0);
            }
        }
    
        // Update the car's position based on current speed and direction (angle)
        let newX = playerData.x + playerData.currentSpeed * Math.cos(degreesToRadians(playerData.angle - 90));
        let newY = playerData.y + playerData.currentSpeed * Math.sin(degreesToRadians(playerData.angle - 90));
    
        // Ensure the car stays within the bounds of the container
        const containerWidth = $('.container').width();
        const containerHeight = $('.container').height();
    
        const carWidth = playerData.width;
        const carHeight = playerData.height;
    
        // Check horizontal boundaries
        if (newX < 0) newX = 0;
        if (newX + carWidth > containerWidth) newX = containerWidth - carWidth;
    
        // Check vertical boundaries
        if (newY < 0) newY = 0;
        if (newY + carHeight > containerHeight) newY = containerHeight - carHeight;
    
        // Update player data with the new position
        playerData.x = newX;
        playerData.y = newY;
    }

    // Function to handle car rotation (turning left or right)
    function rotateCar() {
        if (playerData.currentSpeed !== 0) {
            
            let speedFactor = Math.abs(playerData.currentSpeed) / playerData.maxForwardSpeed;
            let scaledRotationSpeed = playerData.rotationSpeed * speedFactor; 
            
            if (keys.a) {  // If 'a' is pressed, rotate left (counterclockwise)
                playerData.angle -= scaledRotationSpeed;
            }
            if (keys.d) {  // If 'd' is pressed, rotate right (clockwise)
                playerData.angle += scaledRotationSpeed;
            }
        }
    }

    // Update player position in CSS
    function updatePlayerCSS() {
        player.css({
            top: `${playerData.y}px`,
            left: `${playerData.x}px`,
            transform: `rotate(${playerData.angle}deg)`
        });
    }

    // Function to toggle headlights on or off
    function toggleHeadlights() {
        playerData.headlightsOn = !playerData.headlightsOn;

        if (playerData.headlightsOn) {
            headlights.show();
        } else {
            headlights.hide();
        }
    }

    // Check for collisions between player and obstacle
    function checkCollisions() {
        const playerCorners = calculateOBB(playerData);
        const obstacleRect = obstacle[0].getBoundingClientRect();

        if (checkCollision(playerCorners, obstacleRect)) {
            $('#playersCarIMG').css('background-color', 'green');
        } else {
            $('#playersCarIMG').css('background-color', 'transparent');
        }
    }

    // Calculate Oriented Bounding Box (OBB) for player
    function calculateOBB(data) {
        const halfWidth = data.width / 2;
        const halfHeight = data.height / 2;
        const corners = [
            rotatePoint(-halfWidth, -halfHeight, data.angle),
            rotatePoint(halfWidth, -halfHeight, data.angle),
            rotatePoint(halfWidth, halfHeight, data.angle),
            rotatePoint(-halfWidth, halfHeight, data.angle)
        ];
        return corners.map(point => ({
            x: point.x + data.x + halfWidth,
            y: point.y + data.y + halfHeight
        }));
    }

    // Utility to rotate points for OBB calculation
    function rotatePoint(x, y, angle) {
        const radians = angle * Math.PI / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        return {
            x: x * cos - y * sin,
            y: x * sin + y * cos
        };
    }

    // Collision check using Separating Axis Theorem (SAT)
    function checkCollision(playerCorners, obstacleRect) {
        const obstacleCorners = [
            { x: obstacleRect.left, y: obstacleRect.top },
            { x: obstacleRect.right, y: obstacleRect.top },
            { x: obstacleRect.right, y: obstacleRect.bottom },
            { x: obstacleRect.left, y: obstacleRect.bottom }
        ];

        const axes = [
            { x: 1, y: 0 }, { x: 0, y: 1 },
            { x: playerCorners[1].x - playerCorners[0].x, y: playerCorners[1].y - playerCorners[0].y },
            { x: playerCorners[3].x - playerCorners[0].x, y: playerCorners[3].y - playerCorners[0].y }
        ];

        return axes.every(axis => overlapOnAxis(playerCorners, obstacleCorners, axis));
    }

    // Function to check if two sets of corners overlap on a given axis
    function overlapOnAxis(cornersA, cornersB, axis) {
        const projA = projectOntoAxis(cornersA, axis);
        const projB = projectOntoAxis(cornersB, axis);
        return projA.min <= projB.max && projB.min <= projA.max;
    }

    // Function to project a set of corners (vertices) onto a given axis
    function projectOntoAxis(corners, axis) {
        const dots = corners.map(corner => corner.x * axis.x + corner.y * axis.y);
        return { min: Math.min(...dots), max: Math.max(...dots) };
    }

    // Handle key down
    function handleKeyDown(e) {
        if (keys.hasOwnProperty(e.key.toLowerCase())) {
            keys[e.key.toLowerCase()] = true;
        }
        
        if (e.key.toLowerCase() === 'h') {
            toggleHeadlights();
        }
    }

    // Handle key up
    function handleKeyUp(e) {
        if (keys.hasOwnProperty(e.key.toLowerCase())) {
            keys[e.key.toLowerCase()] = false;
        }
    }

    // Utility function: Converts degrees to radians (needed for trigonometry)
    function degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Initialize the timer display
    //timerDisplay.text(gameTimer);
});