import StatsManager from './statsManager.js';
import SpotManager from './spotManager.js';
import ObstacleManager from './obstacleManager.js';
import CollisionHandler from './collisionHandler.js';
import CarManager from './carManager.js';
import InputManager from './inputManager.js';
import Leaderboard from './leaderboard.js';

class Game {
    constructor() {
        // Game state variables
        this.unscaledSize = 1000;
        this.gameState = 'loading'; // Initial game state
        this.gamePaused = true;
        this.gameEnded = false;
        this.overlay = null;

        // Initialize starting managers
        this.carManager = new CarManager();
        this.inputManager = new InputManager(this, this.carManager);
        this.collisionHandler = new CollisionHandler();
        this.obstacleManager = new ObstacleManager(this.collisionHandler);

        // Initialize in-game managers
        this.statsManager = new StatsManager();
        this.spotManager = new SpotManager();

        // Initialize leaderboard
        this.leaderboard = new Leaderboard();
    }

    /**
     * Initialize the game by starting the update loop and adding event listeners.
     */
    init() {
        // Resize the game window
        if (this.resize()) {
            // Load the game
            this.loadGame();

            // Initialize event listeners
            this.addEventListeners();

            // Main update loop for moving and rotating the car
            setInterval(() => this.updatePlayer(), 10);
        }
    }

    /**
     * Add UI and scaling-related event listeners.
     */
    handleBtnEvent(event, callback) {
        if (event.type === "click" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            callback();
        }
    }

    addEventListeners() {
        $(window).on("resize", () => this.resize());

        $(window).on("visibilitychange", () => {
            if (document.hidden && !this.gamePaused) this.togglePaused();
        });

        $(".start-button").on("click", () => this.showSpotlight());

        // Event listener for all buttons with data-action attributes
        $(document).on("click keydown", "[data-action]", (e) => {
            this.handleBtnEvent(e, () => {
                const action = $(e.currentTarget).data("action");

                // Map actions to corresponding methods
                const actions = {
                    togglePaused: () => this.togglePaused(),
                    restartGame: () => this.restartGame(),
                    confirmExitGame: () => this.confirmExitGame(),
                    exitGame: () => this.exitGame(),
                    saveName: () => this.saveName(),
                    discardName: () => this.discardName(),
                    toggleHelp: () => this.toggleOverlay("help"),
                    toggleLeaderboard: () => this.toggleOverlay("leaderboard"),
                    closeOverlay: () => this.closeOverlay(),
                };

                // Execute the appropriate method
                if (actions[action]) actions[action]();
            });
        });
    }

    /**
     * Resize the game window and adjust scaling based on the browser window size.
     */
    resize() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        let newSize = Math.min(width, height);
        let scale = newSize / this.unscaledSize;

        // Calculate margins to center horizontally and vertically
        let marginLeft = (width - newSize) / 2;
        let marginTop = (height - newSize) / 2;

        // Apply scale and centering to the game window and controls
        $('#game-window').css({
            transform: `scale(${scale})`,
            marginLeft: `${marginLeft}px`,
            marginTop: `${marginTop}px`
        });

        // Update the scale in the collision detection module
        this.collisionHandler.updateScale(scale);

        // Return true when complete
        return true;
    }

    /**
     * Main game loop to update player movement, handle collisions, and check game state.
     */
    updatePlayer() {
        // Stop the function if the game is paused
        if (this.gamePaused) return;

        requestAnimationFrame(() => {
            this.carManager.moveCar(this.inputManager.keys); // Move the car based on key inputs
            this.carManager.rotateCar(this.inputManager.keys); // Rotate the car
            this.carManager.updatePosition(); // Update the car's position in CSS
        });

        // Check for collisions with obstacles
        const collision = this.collisionHandler.checkCollisions(this.carManager.playerData);
        if (this.carManager.registerCollision && collision) {
            this.handleCollision();
            return;
        }

        // Check if the car is contained within the mode buttons
        if (this.gameState == "start") {
            const chosenMode = this.carManager.checkParkingButtons();
            if (chosenMode) this.startGame(chosenMode);
            return;
        }

        // Check if car is in the selected parking spot
        const correctSpot = this.spotManager.checkParkingCompletion();
        if (correctSpot) this.handleRoundWin();
    }

    loadGame() {
        // Step 1: Quickly cycle through all background images to preload them
        setTimeout(() => {
            $("#game-window").css("background-image", "url(./img/game-lot.png)");
        }, 50);
        setTimeout(() => {
            $("#game-window").css("background-image", "url(./img/starting-lot.png)");
        }, 100);
        setTimeout(() => {
            $("#game-window").css("background-image", "url(./img/loading-lot.png)");
        }, 150);

        // Step 2: Fade in #game-window at 200ms while hiding certain UI elements
        setTimeout(() => {
            $(".starting-obstacle, #start-buttons, .game-subtitle, #car").css("opacity", "0"); // Hide UI elements
            $("#game-window").animate({ opacity: 1 }, 1000); // Smooth fade-in over 1 second
        }, 2);

        // Step 3: Fade out the startup screen at 3s and start the loading bar animation
        setTimeout(() => {
            $("#startup-screen").animate({ opacity: 0 }, 500); // Smooth fade-out of startup screen
            $("#game-window").addClass("border-black"); // Add a border after startup fades out
            this.initLoadingBar(6500); // Start the loading bar animation (7s duration)
        }, 3000);

        // Step 4: After 10 seconds, transition to the main game screen if still in the "loading" state
        setTimeout(() => {
            if (this.gameState === "loading") this.initStartScreen(); // Move to the next phase
        }, 9500);
    }

    initLoadingBar(time) {
        let progress = 0;
        const interval = 50; // Update every 50ms
        const increment = 100 / (time / interval); // Dynamically calculated increment

        function updateProgress() {
            if (progress >= 100) {
                clearInterval(loadingInterval); // Stop updates when 100% is reached
                return;
            }
            progress += increment;
            $(".progress").css("width", progress + "%");
        }

        // Run updateProgress() every 50ms
        let loadingInterval = setInterval(updateProgress, interval);
    }

    initStartScreen() {
        $("#game-window").css("background-image", "url(./img/starting-lot.png)");
        $("#game-window").removeClass("border-black").addClass("border-white");
        $("#loading-container").addClass("hidden");
        $(".starting-obstacle, #start-buttons, .game-subtitle").animate({ opacity: 1 }, 400);

        // Reset car under the screen
        $("#car").css({ opacity: 1, top: "120px" });
        this.carManager.resetCar(this.gameState);

        // The car drives in after 200ms
        setTimeout(() => {
            $("#car").animate({ top: "0px" }, 800, "swing");
            this.gamePaused = false;
            this.gameState = 'start';
        }, 200);
    }

    /**
     * Start the game in the selected mode (easy or hard).
     * @param {string} mode - The mode to start the game in.
     */
    startGame(mode = this.gameState) {
        this.gameState = mode;
        this.carManager.stopCar();
        this.statsManager.resetStats(this.gameState);

        $(`#${mode}-button`).addClass("selected");
        $(".starting-obstacle, .text, .sirens, #loading-container").addClass("hidden");
        $(".game-divider, .game-section").removeClass('hidden');

        // Display the game background
        $("#game-window").css("background-image", "url(./img/game-lot.png)");

        // Change the button color based on the selected mode
        const gameInfoColor = (this.gameState === "easy-mode") ? "green" : "red";
        $("#game-info").removeClass("text-red text-green").addClass(`text-${gameInfoColor}`);

        this.showModal("yellow", "Start!");
        setTimeout(() => {
            $("#start-buttons").addClass("hidden");
            this.newRound();
        }, 700);
    }

    /**
     * Set up a new round by resetting obstacles, car position, and game state.
     */
    newRound() {
        // Prevent starting a new round if the game has been ended
        if (this.gameState === "start") return;

        this.gamePaused = false;
        this.carManager.resetCar(this.gameState);
        this.obstacleManager.resetObstacles();

        // Reset lives in easy mode
        if (this.gameState == "easy-mode") this.statsManager.resetLives(this.gameState);

        this.statsManager.startTimer();
        this.statsManager.resetTimer();

        this.spotManager.revertSpot();
        this.spotManager.updateSpot(this.statsManager.getRounds());

        this.obstacleManager.resetObstacles();
        this.obstacleManager.generateAllObstacles(this.gameState, this.spotManager);
    }

    /**
     * Restart the game, resetting rounds, lives, and score.
     */
    restartGame() {
        $("#modal").addClass("hidden");
        $(".game-button").removeClass("disabled");

        this.gameEnded = false;
        this.statsManager.resetStats(this.gameState);
        this.obstacleManager.resetObstacles();

        this.showModal("yellow", "Start!");
        this.gamePaused = false;
        this.carManager.resetCar(this.gameState);
        this.spotManager.revertSpot();

        setTimeout(() => this.gamePaused = true, 100);
        setTimeout(() => this.newRound(), 700);
    }

    /**
     * Exit the game and return to the start screen.
     */
    exitGame() {
        // Save the score if the game hasn't ended yet
        if (!this.gameEnded && this.leaderboard.playerName) {
            this.leaderboard.addScore(this.statsManager.getScore());
        }

        this.gamePaused = false;
        this.gameEnded = false;

        this.gameState = 'start';
        $("#game-window").css("background-image", "url(./img/starting-lot.png)");
        $(".game-divider, #modal, .game-section").addClass("hidden");
        $("#start-buttons, .starting-obstacle, .text, .sirens").removeClass("hidden");
        $(".start-button").removeClass("selected");
        $(".game-button").removeClass("disabled");

        this.statsManager.stopTimer();
        this.statsManager.resetTimer();
        this.statsManager.resetStats(this.gameState);

        this.spotManager.revertSpot();
        this.obstacleManager.resetObstacles();

        this.carManager.resetCar(this.gameState);
        this.carManager.setSpeed(this.gameState);
    }

    /**
     * Handle the logic when the player wins a round.
     */
    handleRoundWin() {
        // Stop the car
        this.gamePaused = true;
        this.carManager.stopCar();

        // Prevent explosions and trigger confetti
        this.carManager.hideExplosion();
        this.carManager.triggerConfetti();

        // Increase rounds and update the score
        this.statsManager.increaseRounds();
        this.statsManager.updateScore(this.gameState);

        this.showModal("green", "Next Round!");
        setTimeout(() => this.newRound(), 700);
    }

    /**
     * Handle collisions, including removing a life and triggering an explosion.
     */
    handleCollision() {
        this.carManager.stopCar();
        this.carManager.triggerExplosion();

        // If the game is in start mode, don't remove a life
        if (this.gameState !== "start") {
            this.statsManager.removeLife();
            if (this.statsManager.getLives() == 0) {
                this.gameOver();
                return;
            }
        }

        // If the game state hasn't changed, reset the car after the explosion
        const currGameState = this.gameState;
        setTimeout(() => {
            if (this.gameState === currGameState) {
                this.carManager.resetCar(this.gameState);
            }
        }, this.carManager.explosionDurationMs);
    }

    /**
     * End the game when the player runs out of lives.
     */
    gameOver() {
        const score = this.statsManager.getScore();

        this.statsManager.stopTimer();
        this.gamePaused = true;
        this.gameEnded = true;

        $(".game-button").addClass("disabled");

        // Ensure player name is set
        if (!this.leaderboard.playerName && score > 0) {
            setTimeout(() => {
                const modalStr = "Enter your name to start saving your scores!<br><br>Warning: This cannot be changed.";
                this.showModal("yellow", "Save Score", modalStr, ["#save-name", "#discard-name"], "#player-name");
            }, 700);
            return;
        }

        // Save the score and show the Game Over screen
        this.leaderboard.addScore(score);
        setTimeout(() => {
            let scoreStr = `Score: ${score}`;
            if (this.leaderboard.getLowestScore() <= score) {
                scoreStr += "<br><br>Your score has been added to the leaderboard!";
            }
            this.showModal("red", "Game Over!", scoreStr, ["#play-again", "#exit-game"]);
        }, 700);
    }

    togglePaused() {
        if (this.gameState !== "start" && !this.gameEnded) {
            this.gamePaused = !this.gamePaused;
            if (this.gamePaused) {
                $("#pause-play-icon").attr("src", "./img/hud/play-icon.svg");
                this.statsManager.stopTimer();
                this.showModal("yellow", "Game Paused", `Current score: ${this.statsManager.getScore()}`, ["#resume-game", "#confirm-exit-game"]);
            } else {
                $("#pause-play-icon").attr("src", "./img/hud/pause-icon.svg");
                this.statsManager.startTimer();
                $("#modal").addClass("hidden");
            }
        }
    }

    confirmExitGame() {
        if (this.gameEnded) return;

        const currScore = this.statsManager.getScore();
        if (currScore > 0) {
            this.gamePaused = true;
            this.statsManager.stopTimer();

            let modalStr = `Your score (${currScore}) will not be saved.`;
            if (this.leaderboard.playerName && this.leaderboard.getLowestScore() <= currScore) {
                modalStr = `Your score (${currScore}) will be added to the leaderboard.`;
            }

            this.showModal("yellow", "Exit Game?", modalStr, ["#exit-game", "#cancel-exit"]);
        } else if (this.gameState !== "start") {
            this.exitGame();
        }
    }

    showModal(textColor, title, content = null, buttons = null, input = null) {
        // Reset the modal
        $("#modal-content, #modal-input, #modal-buttons, .modal-button").addClass("hidden");
        $("#modal-title").removeClass().addClass(`text-${textColor}`).text(title);
        $("#modal").removeClass();

        // Show the appropriate sections of the modal
        if (content) $("#modal-content").removeClass("hidden").html(content);

        if (buttons) {
            $("#modal-buttons").removeClass("hidden");
            for (let buttonID of buttons) {
                $(buttonID).removeClass("hidden");
            }

            // Add tabindex dynamically to make the modal focusable
            $("#modal-buttons > div").attr("tabindex", "0");

            // Focus the first child of the modal buttons
            setTimeout(() => $(".modal-button:not(.hidden)").first().focus(), 100);
        }

        if (input) {
            $("#modal-input").removeClass("hidden");
            setTimeout(() => $("#modal-input > input").focus(), 100);
        }

        // Hide the modal after 700ms
        if (!buttons) {
            setTimeout(() => $("#modal").removeClass().addClass("hidden"), 700);
        }
    }

    toggleOverlay(id) {
        $(`#${id}, #overlay-screen`).toggleClass("hidden");

        this.overlay = this.overlay ? null : id;
        if (this.overlay) this.statsManager.stopTimer();
        else if (!this.gamePaused) this.statsManager.startTimer();
    }

    closeOverlay() {
        $("#help, #leaderboard, #overlay-screen").addClass("hidden");
        this.overlay = null;

        if (!this.gamePaused) this.statsManager.startTimer();
    }

    showSpotlight() {
        if (this.gameState === "start") {
            $("#subtitle-spotlight").removeClass("hidden");
        }

        setTimeout(() => {
            $("#subtitle-spotlight").addClass("hidden");

            if (this.gameState === "start") {
                $("#car-spotlight").removeClass("hidden");
            }

            setTimeout(() => $("#car-spotlight").addClass("hidden"), 1000);
        }, 1500);
    }

    saveName() {
        const input = $("#player-name").val();
        const score = this.statsManager.getScore();

        if (this.leaderboard.setPlayerName(input.trim())) {
            this.leaderboard.addScore(score);
            let scoreStr = `Score: ${score}`;
            if (this.leaderboard.getLowestScore() <= score) {
                scoreStr += "<br><br>Your score has been added to the leaderboard!";
            }
            this.showModal("red", "Game Over!", scoreStr, ["#play-again", "#exit-game"]);
        } else {
            setTimeout(() => $("#player-name").addClass("input-invalid").val("").focus(), 100);
        }
    }

    discardName() {
        const score = this.statsManager.getScore();

        $("#player-name").removeClass("input-invalid");
        this.showModal("red", "Game Over!", `Score: ${score}`, ["#play-again", "#exit-game"]);
    }
}

export default Game;