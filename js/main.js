import { playerData, moveCar, rotateCar, updatePlayerCSS, toggleHeadlights, resetCarPosition } from './movement.js';
import { checkCollisions, registerObstacle } from './collision.js';
import { startTimer, resetTimerFile } from './timer.js';
import { checkParkingCompletion, resetParkingFile } from './parkingspot.js';
import { setGameActive, isGameActive } from './gamestate.js'; 

$(function () {
    // Car Vars
    const player = $('#car');
    const headlights = $('#headlights');

    // Obstacle Vars
    const coneHitbox = $('#cone-hitbox');
    const cone = $('#cone-obstacle');
    const dumpsterHitbox = $('#dumpster-hitbox');
    const dumpster = $('#dumpster-obstacle');

    // Parking Vars
    const parkingSpot = $('#parking-spot');
    const missionCompleteMessage = $('#mission-complete-message');
    const missionFailedMessage = $('#mission-failed-message');

    // Register obstacles
    registerObstacle(coneHitbox, cone);
    registerObstacle(dumpsterHitbox, dumpster);

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
        if (isGameActive()) {
            moveCar(keys, startTimer);
            rotateCar(keys);
            updatePlayerCSS(player);
            const collision = checkCollisions(playerData);
            updateCollisionVisual(collision);
            checkParkingCompletion(); 
        }
    }

    // Create collision visual: green box when there is a collision
    function updateCollisionVisual(collision) {
        $('#car-hitbox').css('background-color', collision ? 'rgba(0, 255, 0, 0.3)' : 'transparent');
    }

    // Handle key down
    function handleKeyDown(e) {
        if (!isGameActive()) return; 
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
        if (!isGameActive()) return; 
        const key = e.key.toLowerCase();
    
        if (keys.hasOwnProperty(key) || keys.hasOwnProperty(e.code)) {
            keys[key] = false;
            keys[e.code] = false;
        }
    }

    // This function sets game as inactive
    // setGameInactive function is defined in the global scope (attached to the window object)
    window.setGameInactive = function() {
        setGameActive(false); 
        setTimeout(resetGame, 3000); 
    }

    // Reset the game
    function resetGame() {
        resetCarPosition(); // Reset car position and speed
        resetTimerFile(); // Reset the timer
        resetParkingFile();
        setGameActive(true); // Reactivate game
    }
});