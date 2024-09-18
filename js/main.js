import { playerData, moveCar, rotateCar, updatePlayerCSS, toggleHeadlights } from './movement.js';
import { checkCollisions } from './collision.js';

$(function () {
    // Key states
    const keys = {
        w: false,
        s: false,
        a: false,
        d: false
    };

    // DOM elements
    const player = $('#car');
    const obstacle = $('#obstacle');
    const coneHitbox = $('#cone-hitbox');
    const headlights = $('#headlights');

    // Handle key presses
    $(document).on('keydown', handleKeyDown);
    $(document).on('keyup', handleKeyUp);

    // Main update loop: Runs 50 times per second (every 20ms)
    setInterval(updatePlayer, 10);

    // Set initial state: Turn headlights off
    headlights.hide();

    function updatePlayer() {
        moveCar(keys);
        rotateCar(keys);
        updatePlayerCSS(player);
        const collision = checkCollisions(playerData, coneHitbox, obstacle);
        updateCollisionVisual(collision);
    }

    function updateCollisionVisual(collision) {
        $('#car-hitbox').css('background-color', collision ? 'rgba(0, 255, 0, 0.3)' : 'transparent');
    }

    // Handle key down
    function handleKeyDown(e) {
        if (keys.hasOwnProperty(e.key.toLowerCase())) {
            keys[e.key.toLowerCase()] = true;
        }
        
        if (e.key.toLowerCase() === 'h') {  // Toggle headlights when 'H' key is pressed
            toggleHeadlights(headlights);
        }
    }

    // Handle key up
    function handleKeyUp(e) {
        if (keys.hasOwnProperty(e.key.toLowerCase())) {
            keys[e.key.toLowerCase()] = false;
        }
    }
});

// Open game screen when you click a game mode

$("#buttons .btn").on("click", function () {
    $("#gameScreen").show();
    $("#gameScreen").animate(
        { marginTop: "-100vh" },
        1000
    );
});