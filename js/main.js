import { playerData, moveCar, rotateCar, stopCar, resetCar, checkContainmentButtons, updatePlayerCSS, toggleHeadlights } from './movement.js';
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
    let lives = 0;

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

        // Collisions
        const collision = checkCollisions(playerData);
        if (collision) {
            resetCar(keys);
            removeLife();
        }

        // Containment
        const chosenMode = checkContainmentButtons();
        if (chosenMode && gameState == "start") startGame(chosenMode);

        updateCollisionVisual(collision);
    }

    function updateCollisionVisual(collision) {
        $('#car-hitbox').css('background-color', collision ? 'rgba(0, 255, 0, 0.3)' : 'transparent');
    }

    function startGame(mode) {
        stopCar();
        gameState = mode;

        $("#Subtitle").text(mode.replace("-", " "));

        setTimeout(function () {
            $("#start-buttons").hide();
            $("#game-buttons").show();
            $("#lives-counter").show();
            resetCar();
            resetLives();
        }, 700);

        if (mode == "easy-mode") {
            $("#easy-mode-button").css("background-color", "darkgreen");
        } else if (mode == "hard-mode") {
            $("#hard-mode-button").css("background-color", "darkred");
        }
    }

    function resetLives() {
        if (gameState == "easy-mode") {
            lives = 5;
        } else if (gameState == "hard-mode") {
            lives = 3;
        }
        for (let i = 0; i < lives; i++) {
            const life = document.createElement("div");
            life.classList.add("game-life");
            
            // Create an image element
            const lifeImg = document.createElement("img");
            lifeImg.src = "../img/hud/wrench-screwdriver.png";
            lifeImg.alt = "Life"; // Alt text for accessibility
            lifeImg.width = 40; // Adjust the size if needed
    
            // Append the image to the life div
            life.appendChild(lifeImg);
            $("#lives-counter").append(life);
        }
    }

    function removeLife() {
        if (gameState != "start") {
            let livesElements = $(".game-life");
            livesElements[lives - 1].remove();
            lives -= 1;
            if (lives == 0) {
                // Handle game end
            }
        }
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

    $("#exit-game-button").on("click", function () {
        gameState = 'start';

        $("#Subtitle").text("Group 8: Aman Singh, Julia O'Neill, Kyle Malice, Solenn Gacon, Suhas Bolledula");

        $("#game-buttons").hide();
        $("#start-buttons").show();

        $("#easy-mode-button").css("background-color", "green");
        $("#hard-mode-button").css("background-color", "red");

        resetCar();
    });
});