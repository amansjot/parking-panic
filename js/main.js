import { playerData, moveCar, rotateCar, resetCar, updatePlayerCSS, toggleHeadlights } from './movement.js';
import { checkCollisions, registerObstacle, updateScale } from './collision.js';

$(function () {
    // Scaling functionality
    const $scaleWindow = $('#scroll-window');
    const $controls = $('#Controls')
    let unscaledSize = 1000;
    let headerHeight = 150;

    // Initial resize
    resize();

    // Game Vars
    let gameState = 'start';

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

    // Main update loop
    setInterval(updatePlayer, 10);

    // Set initial state: Turn headlights off
    headlights.hide();

    function resize() {
        let width = window.innerWidth;
        let height = window.innerHeight - headerHeight;
        let newSize = Math.min(width, height);
        let scale = newSize / unscaledSize;
    
        $scaleWindow.css('transform', `scale(${scale})`);
        $scaleWindow.css('margin-left', (width - newSize) / 2 + "px");

        $controls.css('transform', `scale(${scale * 1.3})`);
        // $controls.css('margin-left', (width - newSize) / 2 + "px");
        
        // Update the scale in collision.js
        updateScale(scale);
    }

    // Add resize event listener
    window.addEventListener("resize", resize);  // Resize game window on resize event

    function updatePlayer() {
        moveCar(keys);
        rotateCar(keys);
        updatePlayerCSS(player);
        const collision = checkCollisions(playerData);
        if (collision) {
            resetCar(keys);
        }
        updateCollisionVisual(collision);
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