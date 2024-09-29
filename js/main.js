import { playerData, moveCar, rotateCar, stopCar, resetCar, checkContainmentButtons, updatePlayerCSS, toggleHeadlights, playHorn } from './movement.js';
import { checkCollisions } from './collision.js';
import { resize, addResizeEventListener } from './resize.js';
import { initializeMapBounds, initializeParkingDividers, initializeObstacles, createObstacle, generateObstaclePosition, resetRedZones } from './obstacles.js';
import { startTimer, stopTimer, resetTimer } from './timer.js';
import { updateSpot, checkParkingCompletion, revertParkingSpot } from './randomspot.js';

$(function () {
    // Initial resize of the game window
    resize();
    addResizeEventListener();

    // Game state variables
    let gameState = 'start'; // Initial game state
    let lives = 0; // Initial player lives

    // Car-related variables
    const player = $('#car');
    const headlights = $('#headlights');

    // Collision related variables
    let registerCollision = true;

    // Initialize map boundaries, parking dividers, and obstacles
    initializeMapBounds();
    initializeParkingDividers();
    initializeObstacles();

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

    const coneSize = { w: 50, h: 50 }; // 50x50 px cones
    const dumpsterSize = { w: 45, h: 25 };

    // Handle key presses (keydown and keyup events)
    $(document).on('keydown', handleKeyDown);
    $(document).on('keyup', handleKeyUp);

    // Main update loop for moving and rotating the car
    setInterval(updatePlayer, 10);

    // Initially hide the headlights
    headlights.hide();

    // Add resize event listener for the game window
    window.addEventListener("resize", resize);

    // Function to update the player's position and handle collisions
    function updatePlayer() {
        moveCar(keys); // Move the car based on key inputs
        rotateCar(keys); // Rotate the car
        updatePlayerCSS(player); // Update the car's position in CSS
        startTimer();

        //Check if car is in the chose parking spot
        const correctSpot = checkParkingCompletion();
        if (correctSpot) {
            stopCar();
            registerCollision = false;

            resetGame("win");
            revertParkingSpot();
            stopTimer();
            resetTimer();
            revertParkingSpot();

            setTimeout(function () {
                registerCollision = true;
                resetCar(gameState);
            }, 700);

            // updateSpot();
        }

        // Check for collisions with obstacles
        const collision = checkCollisions(playerData);
        if (registerCollision && collision) {
            // stopCar();
            removeLife(); // Remove a life on collision
            triggerExplosion();
            // resetCar(gameState);
        }

        // Check if the car is contained within the mode buttons
        const chosenMode = checkContainmentButtons();
        if (chosenMode && gameState == "start") startGame(chosenMode);

        updateCollisionVisual(collision); // Update the collision visual
    }

    function triggerExplosion() {
        stopCar();

        // Get the explosion and car elements
        const carExplosion = document.getElementById('car-explosion');
        const carImage = document.getElementById('playersCar-img');

        // Hide the car element
        carImage.style.visibility = 'hidden'; // Use 'visibility' to keep layout, or 'display' to remove it

        // Show the explosion over the car
        carExplosion.style.display = 'block';

        // Hide the explosion and show the car again after a short delay (duration of your GIF)
        setTimeout(() => {
            carExplosion.style.display = 'none';  // Hide the explosion
            carImage.style.visibility = 'visible';  // Show the car again

            resetCar(gameState);
        }, 1610); // Adjust this timing to match your GIF duration
    }


    // Visual indicator for collision detection (changes car hitbox color)
    function updateCollisionVisual(collision) {
        $('#car-hitbox').css('background-color', collision ? 'rgba(0, 255, 0, 0.3)' : 'transparent');
    }

    // Function to start the game based on the selected mode
    function startGame(mode) {
        if (gameState == "start") {
            $("#cone-1, #cone-2, .dumpster-obstacle").hide();
            stopCar();
            setTimeout(function () {
                resetCar(gameState); // Reset car for the new game mode
            }, 700);
        }

        gameState = mode;

        // Display the selected game mode (Easy or Hard)
        $("#game-mode").text(mode.replace("-", " "));

        setTimeout(function () {
            // Hide start buttons, show game buttons and lives counter
            $("#start-buttons").hide();
            $("#game-buttons").show();
            $("#lives-counter").show();

            // Display the game background
            $("#scroll-window").css("background-image", "url(../img/parkinglot.png)");

            resetLives(); // Reset player lives

            // Show dividers for the game screen
            $("#top-left-divider, #top-right-divider, #bottom-right-divider").show();

            let numCones = 3;
            let numDumpsters = 2;
            if (gameState == "hard-mode") {
                numCones = 6;
                numDumpsters = 4;
            }

            // Generate random cone obstacles
            for (let i = 0; i < numCones; i++) {
                let { posX, posY } = generateObstaclePosition(coneSize);
                console.log(posX);
                createObstacle("cone", posX, posY);
            }

            // Generate random dumpster obstacles
            for (let i = 0; i < numDumpsters; i++) {
                const { posX, posY } = generateObstaclePosition(dumpsterSize);
                createObstacle("dumpster", posX, posY );
            }

            // Generate random car obstacles
            // for (let i = 0; i < 3; i++) {
            //     const random1 = Math.floor(Math.random() * (850 - 150 + 1)) + 150;
            //     const random2 = Math.floor(Math.random() * (850 - 150 + 1)) + 150;
            //     createObstacle("car", random1, random2);
            // }

            updateSpot();
        }, 700);

        // Change the button color based on the selected mode
        if (gameState == "easy-mode") {
            $("#easy-mode-button").css("background-color", "darkgreen");
        } else if (gameState == "hard-mode") {
            $("#hard-mode-button").css("background-color", "darkred");
        }

        revertParkingSpot();
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
        $(".game-life").remove();
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
        registerCollision = false;
        stopCar();
        setTimeout(function () {
            resetCar(gameState);
            registerCollision = true;
        }, 1600);

        if (gameState != "start") {
            let livesElements = $(".game-life");
            livesElements[lives - 1].remove(); // Remove the last life icon
            lives -= 1; // Decrease life count
            if (lives == 0) {
                resetGame("lose");
            }
        }
    }

    // Function to reset the game when the player wins or loses
    function resetGame(result) {
        // stopCar(); // Stop the car

        setTimeout(function () {
            $(".cone-obstacle, .dumpster-obstacle, .car-obstacle").remove(); // Remove all obstacles
        }, 700);

        // Display win or lose message
        if (result == "win") {
            displayMessage("You Win!", "green", "white");
        } else if (result == "lose") {
            displayMessage("You Lose!", "red", "white");
        }

        // Restart the game after displaying the result
        revertParkingSpot();
        resetRedZones();
        updateSpot();
        resetTimer();
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

        // Play horn with g
        if (key === 'g') {  // ' ' is the spacebar key
            playHorn();
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

        // Display the start background
        $("#scroll-window").css("background-image", "url(../img/starter-parkinglot.png)");

        // Hide dividers and obstacles for the start screen
        $(".cone-obstacle, .dumpster-obstacle, .car-obstacle").remove();
        $("#top-left-divider, #top-right-divider, #bottom-right-divider").hide();

        $("#Subtitle").text("Group 8: Aman Singh, Julia O'Neill, Kyle Malice, Solenn Gacon, Suhas Bolledula");

        $("#lives-counter").hide(); // Hide lives counter
        $("#game-buttons").hide(); // Hide game buttons
        $("#start-buttons").show(); // Show start buttons
        $("#cone-1, #cone-2").show();

        // Reset button colors
        $("#easy-mode-button").css("background-color", "green");
        $("#hard-mode-button").css("background-color", "red");

        revertParkingSpot();
        resetCar(gameState); // Reset the car to the start position
    });
});