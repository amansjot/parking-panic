import { playerData, moveCar, rotateCar, updatePlayerCSS, toggleHeadlights } from './movement.js';
import { checkCollisions, registerObstacle } from './collision.js';
import { startTimer, stopTimer } from './timer.js';
import { checkParkingCompletion } from './parkingspot.js';

$(function () {
    // Car Vars
    const player = $('#car');
    const headlights = $('#headlights');

    // Obstacle Vars
    const coneHitbox = $('#cone-hitbox');
    const cone = $('#cone-obstacle');
    const dumpsterHitbox = $('#dumpster-hitbox');
    const dumpster = $('#dumpster-obstacle');

    let gameActive = true;

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
        if (gameActive) {
            moveCar(keys, startTimer);
            rotateCar(keys);
            updatePlayerCSS(player);
            const collision = checkCollisions(playerData);
            updateCollisionVisual(collision);
            checkParkingCompletion(setGameInactive); // Check if the game should end
        }
    }

    function updateCollisionVisual(collision) {
        $('#car-hitbox').css('background-color', collision ? 'rgba(0, 255, 0, 0.3)' : 'transparent');
    }

    // Handle key down
    function handleKeyDown(e) {
        if (!gameActive) return;
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
        if (!gameActive) return;
        const key = e.key.toLowerCase();
    
        if (keys.hasOwnProperty(key) || keys.hasOwnProperty(e.code)) {
            keys[key] = false;
            keys[e.code] = false;
        }
    }

    // This function sets game as inactive
    function setGameInactive() {
        gameActive = false; // Disable game active status to stop car movement
    }
});