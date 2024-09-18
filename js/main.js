import { playerData, moveCar, rotateCar, updatePlayerCSS, toggleHeadlights } from './movement.js';
import { checkCollisions, registerObstacle, calculateOBB } from './collision.js';

$(function () {
    // Car Vars
    const player = $('#car');
    const headlights = $('#headlights');

    // Obstacle Vars
    const coneHitbox = $('#cone-hitbox');
    const cone = $('#cone-obstacle');
    const dumpsterHitbox = $('#dumpster-hitbox');
    const dumpster = $('#dumpster-obstacle');

    // Parking spot and messages
    const parkingSpot = $('#parking-spot');
    const missionCompleteMessage = $('#mission-complete-message');
    const missionFailedMessage = $('#mission-failed-message');

    // Register obstacles
    registerObstacle(coneHitbox, cone);
    registerObstacle(dumpsterHitbox, dumpster);

    // Timer
    let timeLeft = 30; // Starting time in seconds
    let timerInterval;
    const timerElement = $('#timer-display');

    // Key states
    const keys = {
        w: false,
        s: false,
        a: false,
        d: false,
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };

    // Handle key presses
    $(document).on('keydown', handleKeyDown);
    $(document).on('keyup', handleKeyUp);

    // Main update loop
    setInterval(updatePlayer, 10);

    // Set initial state: Turn headlights off
    headlights.hide();


    function updatePlayer() {
        moveCar(keys, startTimer);
        rotateCar(keys);
        updatePlayerCSS(player);
        const collision = checkCollisions(playerData);
        updateCollisionVisual(collision);
        checkParkingCompletion();
    }

    function updateCollisionVisual(collision) {
        $('#car-hitbox').css('background-color', collision ? 'rgba(0, 255, 0, 0.3)' : 'transparent');
    }

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

    // Handle key down
    function handleKeyDown(e) {
        const key = e.key.toLowerCase();
    
        if (keys.hasOwnProperty(key) || keys.hasOwnProperty(e.code)) {
            keys[key] = true;
            keys[e.code] = true;
        }
    
        if (key === 'h') {
            toggleHeadlights($('#headlights'));
        }
    }

    // Handle key up
    function handleKeyUp(e) {
        const key = e.key.toLowerCase();
    
        if (keys.hasOwnProperty(key) || keys.hasOwnProperty(e.code)) {
            keys[key] = false;
            keys[e.code] = false;
        }
    }

    function startTimer() {
        if (!timerInterval) {
            timerInterval = setInterval(updateTimer, 1000);
        }
    }

    // Update the timer every second
    function updateTimer() {
        timeLeft -= 1;
        timerElement.text(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerElement.text("Time's up!");
            // Trigger a failure state if time runs out and car is not parked
            if (!isCarCompletelyInSpot) {
                alert("Mission failed: Time's up!");
                // Optionally reset game or display failure UI
            }
        }
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
});