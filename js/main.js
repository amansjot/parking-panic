import { playerData, moveCar, rotateCar, stopCar, resetCar, checkContainmentButtons, updatePlayerCSS, toggleHeadlights } from './movement.js';
import { checkCollisions, registerObstacle, updateScale } from './collision.js';

$(function () {
    // DOM elements and scaling variables
    const $scaleWindow = $('#scroll-window');
    const $controls = $('#controls');
    let unscaledSize = 1000;
    let headerHeight = 150;

    // Initial resize of the game window
    resize();

    // Game state variables
    let gameState = 'start'; // Initial game state
    let lives = 0; // Initial player lives

    // Car-related variables
    const player = $('#car');
    const headlights = $('#headlights');

    // map bounds
    const mapBounds = $('#map-bounds');
    const boundsSides = ['top', 'right', 'bottom', 'left'];

    boundsSides.forEach(side => {
        const boundHitbox = $(`#${side}-bounds`);
        registerObstacle(boundHitbox, mapBounds);
    });

    // map bounds
    const mapBounds = $('#map-bounds');
    const boundsSides = ['top', 'right', 'bottom', 'left'];

    boundsSides.forEach(side => {
        const boundHitbox = $(`#${side}-bounds`);
        registerObstacle(boundHitbox, mapBounds);
    });

    // Obstacle-related variables
    const coneHitboxes = $('.cone-hitbox');
    const cones = $('.cone-obstacle');
    const dumpsterHitboxes = $('.dumpster-hitbox');
    const dumpsters = $('.dumpster-obstacle');

    // Register each obstacle (cones and dumpsters)
    cones.each(function (index) {
        registerObstacle(coneHitboxes.eq(index), cones.eq(index));
    });

    dumpsters.each(function (index) {
        registerObstacle(dumpsterHitboxes.eq(index), dumpsters.eq(index));
    });

    // Key states for controlling the car
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

    // Handle key presses (keydown and keyup events)
    $(document).on('keydown', handleKeyDown);
    $(document).on('keyup', handleKeyUp);

    // Main update loop for moving and rotating the car
    setInterval(updatePlayer, 10);

    // Initially hide the headlights
    headlights.hide();

    // Function to resize the game window and adjust scaling
    function resize() {
        let width = window.innerWidth;
        let height = window.innerHeight - headerHeight;
        let newSize = Math.min(width, height);
        let scale = newSize / unscaledSize;

        // Apply scale to the game window and controls
        $scaleWindow.css('transform', `scale(${scale})`);
        $scaleWindow.css('margin-left', (width - newSize) / 2 + "px");
        $controls.css('transform', `scale(${scale * 1.3})`);

        // Update the scale in the collision detection module
        updateScale(scale);
    }

    // Add resize event listener for the game window
    window.addEventListener("resize", resize);

    // Function to update the player's position and handle collisions
    function updatePlayer() {
        moveCar(keys); // Move the car based on key inputs
        rotateCar(keys); // Rotate the car
        updatePlayerCSS(player); // Update the car's position in CSS

        // Check for collisions with obstacles
        const collision = checkCollisions(playerData);
        if (collision) {
            resetCar(gameState); // Reset car if collision occurs
            removeLife(); // Remove a life on collision
        }

        // Check if the car is contained within the mode buttons
        const chosenMode = checkContainmentButtons();
        if (chosenMode && gameState == "start") startGame(chosenMode);

        updateCollisionVisual(collision); // Update the collision visual
    }

    // Visual indicator for collision detection (changes car hitbox color)
    function updateCollisionVisual(collision) {
        $('#car-hitbox').css('background-color', collision ? 'rgba(0, 255, 0, 0.3)' : 'transparent');
    }

    // Function to start the game based on the selected mode
    function startGame(mode) {
        stopCar(); // Stop the car when starting a new game
        gameState = mode;

        // Display the selected game mode (Easy or Hard)
        $("#game-mode").text(mode.replace("-", " "));

        setTimeout(function () {
            // Hide start buttons, show game buttons and lives counter
            $("#start-buttons").hide();
            $("#game-buttons").show();
            $("#lives-counter").show();

            resetCar(gameState); // Reset car for the new game mode
            resetLives(); // Reset player lives

            // Generate random cone obstacles
            for (let i = 0; i < 4; i++) {
                const random1 = Math.floor(Math.random() * (850 - 150 + 1)) + 150;
                const random2 = Math.floor(Math.random() * (850 - 150 + 1)) + 150;
                createObstacle("cone", random1, random2);
            }

            // Generate random car obstacles
            for (let i = 0; i < 3; i++) {
                const random1 = Math.floor(Math.random() * (850 - 150 + 1)) + 150;
                const random2 = Math.floor(Math.random() * (850 - 150 + 1)) + 150;
                createObstacle("car", random1, random2);
            }
        }, 700);

        // Change the button color based on the selected mode
        if (mode == "easy-mode") {
            $("#easy-mode-button").css("background-color", "darkgreen");
        } else if (mode == "hard-mode") {
            $("#hard-mode-button").css("background-color", "darkred");
        }
    }

    // Function to reset the player's lives based on game mode
    function resetLives() {
        if (gameState == "easy-mode") {
            lives = 5; // More lives in easy mode
        } else if (gameState == "hard-mode") {
            lives = 3; // Fewer lives in hard mode
            playerData.maxForwardSpeed = 3; // Adjust car speed for hard mode
            playerData.maxReverseSpeed = 2;
            playerData.rotationSpeed = 2.5;
        }

        // Display the remaining lives on the screen
        for (let i = 0; i < lives; i++) {
            const life = document.createElement("div");
            life.classList.add("game-life");

            const lifeImg = document.createElement("img");
            lifeImg.src = "../img/hud/wrench-screwdriver.png";
            lifeImg.alt = "Life";
            lifeImg.width = 40;

            life.appendChild(lifeImg);
            $("#lives-counter").append(life);
        }
    }

    // Function to remove a life after a collision
    function removeLife() {
        if (gameState != "start") {
            let livesElements = $(".game-life");
            livesElements[lives - 1].remove(); // Remove the last life icon
            lives -= 1; // Decrease life count
            if (lives == 0) resetGame("lose"); // Reset game if no lives are left
        }
    }

    // Function to reset the game when the player wins or loses
    function resetGame(result) {
        stopCar(); // Stop the car
        $(".cone-obstacle, .dumpster-obstacle, .car-obstacle").remove(); // Remove all obstacles

        // Display win or lose message
        if (result == "win") {
            displayMessage("You Win!", "green", "white");
        } else if (result == "lose") {
            displayMessage("You Lose!", "red", "white");
        }

        // Restart the game after displaying the result
        startGame(gameState);
    }

    // Function to display messages on the screen
    function displayMessage(message, bg, text) {
        $("#message").show();
        $("#message").text(message);
        $("#message").css({
            "background-color": bg,
            "color": text
        });
        setTimeout(function () {
            $("#message").hide();
        }, 900); // Hide the message after 900ms
    }

    // Function to create obstacles (cones or cars) at random positions
    function createObstacle(type, x, y) {
        if (["dumpster", "cone"].includes(type)) {
            const html = `<div class="${type}-obstacle" style="top: ${x}px; right: ${x}px;">
            <img class="${type}-img" src="img/obstacles/${type}.png" alt="${type}">
            <div class="${type}-hitbox"></div>
            </div>`
            $("#scroll-window").append(html);

            // Register the new obstacle for collision detection
            const obstacleClass = $(`.${type}-obstacle`);
            const obstacleHitboxes = $(`.${type}-hitbox`);
            const index = obstacleClass.length - 1;
            registerObstacle(obstacleHitboxes.eq(index), obstacleClass.eq(index));
        }
    }

    // Function to handle keydown events
    function handleKeyDown(e) {
        const key = e.key.toLowerCase();

        // Set the key state to true when a key is pressed
        if (keys.hasOwnProperty(key) || keys.hasOwnProperty(e.code)) {
            keys[key] = true;
            keys[e.code] = true;
        }

        // Toggle headlights with 'H' key
        if (key === 'h') {
            toggleHeadlights($('#headlights'));
        }
    }

    // Function to handle keyup events
    function handleKeyUp(e) {
        const key = e.key.toLowerCase();

        // Set the key state to false when the key is released
        if (keys.hasOwnProperty(key) || keys.hasOwnProperty(e.code)) {
            keys[key] = false;
            keys[e.code] = false;
        }
    }

    // Function to handle the exit game button click
    $("#exit-game-button").on("click", function () {
        gameState = 'start'; // Reset game state to 'start'

        $("#Subtitle").text("Group 8: Aman Singh, Julia O'Neill, Kyle Malice, Solenn Gacon, Suhas Bolledula");

        $("#lives-counter").hide(); // Hide lives counter
        $("#game-buttons").hide(); // Hide game buttons
        $("#start-buttons").show(); // Show start buttons

        // Reset button colors
        $("#easy-mode-button").css("background-color", "green");
        $("#hard-mode-button").css("background-color", "red");

        resetCar(gameState); // Reset the car to the start position
    });
});
