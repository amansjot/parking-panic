import { playerData, moveCar, rotateCar, updatePlayerCSS, toggleHeadlights } from './movement.js';
import { checkCollisions, registerObstacle, calculateOBB } from './collision.js';
import { startTimer } from './timer.js';
import { checkParkingCompletion, setRandomParkingSpot } from './parkingspot.js';
import { scaleGame } from './scaling.js';
import { updateSpot } from './random_spot.js';

$(function () {
    setRandomParkingSpot(); // Randomize parking spot for each round

    // Car Vars
    const player = $('#car');
    const headlights = $('#headlights');

    // Obstacle Vars
    const coneHitbox = $('#cone-hitbox');
    const cone = $('#cone-obstacle');
    const dumpsterHitbox = $('#dumpster-hitbox');
    const dumpster = $('#dumpster-obstacle');

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

    // Call scaleGame initially
    scaleGame();

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
        scaleGame();
    }

    function updateCollisionVisual(collision) {
        $('#car-hitbox').css('background-color', collision ? 'rgba(0, 255, 0, 0.3)' : 'transparent');
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

});
