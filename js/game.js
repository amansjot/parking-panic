import StatsManager from './statsManager.js';
import SpotManager from './spotManager.js';
import ObstacleManager from './obstacleManager.js';
import CollisionHandler from './collisionHandler.js';
import CarManager from './carManager.js';
import InputManager from './inputManager.js';

class Game {
    constructor() {
        // Game state variables
        this.unscaledSize = 1000;
        this.gameState = 'start'; // Initial game state
        this.gamePaused = false;
        this.gameEnded = false;
        this.$modal = $("#modal");

        // Initialize starting managers
        this.carManager = new CarManager();
        this.inputManager = new InputManager(this, this.carManager);
        this.collisionHandler = new CollisionHandler();
        this.obstacleManager = new ObstacleManager(this.collisionHandler);

        // Initialize in-game managers
        this.statsManager = new StatsManager();
        this.spotManager = new SpotManager();
    }

    /**
     * Initialize the game by starting the update loop and adding event listeners.
     */
    init() {
        // Main update loop for moving and rotating the car
        setInterval(() => this.updatePlayer(), 10);

        // Initialize event listeners and resizing
        this.addEventListeners();
        this.resize();
    }

    /**
     * Add UI and scaling-related event listeners.
     */
    addEventListeners() {
        $(window).on("resize", () => this.resize());
        $(window).on("blur", () => this.pauseGame());
        $("#play-again").on("click", () => this.restartGame());
        $("#resume-game, #cancel-exit, #pause-game-button").on("click", () => this.togglePaused());
        $("#exit-game").on("click", () => this.exitGame());
        $("#exit-game-button").on("click", () => this.confirmExitGame());
        $("#help-button, #close-help").on("click", () => $("#help").toggleClass("hidden"));

        $(".start-button").on("click", () => this.showSpotlight());
    }

    /**
     * Resize the game window and adjust scaling based on the browser window size.
     */
    resize() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        let newSize = Math.min(width, height);
        let scale = newSize / this.unscaledSize;

        // Apply scale to the game window and controls
        $('#scroll-window').css({
            transform: `scale(${scale})`,
            marginLeft: `${(width - newSize) / 2}px`
        });

        // Update the scale in the collision detection module
        this.collisionHandler.updateScale(scale);
    }

    /**
     * Main game loop to update player movement, handle collisions, and check game state.
     */
    updatePlayer() {
        if (this.gamePaused) return; // Stop the function if the game is paused

        requestAnimationFrame(() => {
            this.carManager.moveCar(this.inputManager.keys); // Move the car based on key inputs
            this.carManager.rotateCar(this.inputManager.keys); // Rotate the car
            this.carManager.updatePosition(); // Update the car's position in CSS
        });

        // Check for collisions with obstacles
        const collision = this.collisionHandler.checkCollisions(this.carManager.playerData);
        if (this.carManager.registerCollision && collision) this.handleCollision();

        // Check if the car is contained within the mode buttons
        if (this.gameState == "start") {
            const chosenMode = this.carManager.checkParkingButtons();
            if (chosenMode) this.startGame(chosenMode);
            return;
        }

        // Check if car is in the selected parking spot
        const correctSpot = this.spotManager.checkParkingCompletion();
        if (correctSpot) {
            this.gamePaused = true;
            this.handleRoundWin();
            return;
        }
    }

    /**
     * Start the game in the selected mode (easy or hard).
     * @param {string} mode - The mode to start the game in.
     */
    startGame(mode = this.gameState) {
        this.carManager.stopCar();
        this.statsManager.resetStats(this.gameState);

        if (this.gameState == "start") {
            // Change the button color based on the selected mode
            $(`#${mode}-button`).addClass("selected");

            $(".starting-obstacle, .text, #sirens").addClass("hidden");
        }

        // Display the game background
        $("#scroll-window").css("background-image", "url(./img/game-lot.png)");

        // Display the selected game mode (Easy or Hard)
        this.gameState = mode;
        const gameInfoColor = (this.gameState === "easy-mode") ? "#7fff7f" : "#ff9a9a";

        $("#game-info, #pause-game-button, #exit-game-button, #lives-counter").removeClass('hidden');
        $("#game-info").css("color", gameInfoColor);

        this.showModal("dark", "Start!");

        setTimeout(() => this.newRound(), 700);
    }

    /**
     * Set up a new round by resetting obstacles, car position, and game state.
     */
    newRound() {
        this.carManager.resetCar(this.gameState);
        this.gamePaused = false;

        $(".game-obstacle").remove();
        $("#start-buttons").addClass("hidden");
        $(".starting-divider").removeClass("hidden");

        // Reset lives in easy mode
        if (this.gameState == "easy-mode") this.statsManager.resetLives(this.gameState);

        this.statsManager.startTimer();
        this.statsManager.resetTimer();

        this.spotManager.revertSpot();
        this.spotManager.updateSpot(this.statsManager.rounds);

        this.obstacleManager.resetObstacles();
        this.obstacleManager.generateAllObstacles(this.gameState, this.spotManager);
    }

    /**
     * Restart the game, resetting rounds, lives, and score.
     */
    restartGame() {
        $("#modal").addClass("hidden");

        this.gamePaused = false;
        this.gameEnded = false;

        this.carManager.setSpeed(this.gameState);
        this.statsManager.resetStats(this.gameState);

        this.newRound();
    }

    pauseGame() {
        if (this.gameState !== "start" && !this.gameEnded) {
            this.gamePaused = true;
            this.statsManager.stopTimer();
            this.showModal("dark", "Game Paused", null, ["#resume-game", "#exit-game"]);
        }
    }

    /**
     * Exit the game and return to the start screen.
     */
    exitGame() {
        this.gamePaused = false;
        this.gameEnded = false;

        this.gameState = 'start';
        $("#scroll-window").css("background-image", "url(./img/starting-lot.png)");
        $(".starting-divider, #modal").addClass("hidden");
        $("#game-info, #pause-game-button, #exit-game-button, #lives-counter").addClass('hidden');
        $("#start-buttons, .starting-obstacle, .text, #sirens").removeClass("hidden");
        $(".start-button").removeClass("selected");

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
        // Stop the car and trigger confetti
        this.carManager.stopCar();
        this.spotManager.triggerConfetti();

        // Increase rounds and update the score
        this.statsManager.increaseRounds();
        this.statsManager.updateScore();

        this.showModal("green", "Next Round!");
        setTimeout(() => this.newRound(), 700);
    }

    /**
     * Handle collisions, including removing a life and triggering an explosion.
     */
    handleCollision() {
        this.carManager.stopCar();
        this.carManager.triggerExplosion(this.gameState);

        if (this.gameState !== "start") this.statsManager.removeLife();

        setTimeout(() => this.carManager.resetCar(this.gameState), 1600);

        if (this.gameState !== "start" && this.statsManager.lives == 0) this.gameOver();
    }

    /**
     * End the game when the player runs out of lives.
     */
    gameOver() {
        this.statsManager.stopTimer();
        this.gamePaused = true;
        this.gameEnded = true;

        this.showModal("red", "You Lose!"); // Display lose message

        setTimeout(() => {
            const scoreStr = "Your Score: " + this.statsManager.score;
            this.showModal("dark", "Game Over!", scoreStr, ["#play-again", "#exit-game"]);
        }, 1300);
    }

    togglePaused() {
        if (!this.gameEnded) {
            this.gamePaused = !this.gamePaused;
            if (this.gamePaused) {
                this.statsManager.stopTimer();
                this.showModal("dark", "Game Paused", null, ["#resume-game", "#exit-game"]);
            } else {
                this.statsManager.startTimer();
                $("#modal").addClass("hidden");
            }
        }
    }

    confirmExitGame() {
        const currScore = this.statsManager.score;
        if (currScore > 0) {
            this.gamePaused = true;
            this.statsManager.stopTimer();
            this.showModal("dark", "Exit Game?", "Your score will not be saved.", ["#exit-game", "#cancel-exit"]);
        } else {
            this.exitGame();
        }
    }

    showModal(bg, title, content = null, buttons = null) {
        // Reset the modal
        $("#modal-content, #modal-buttons, .modal-button").addClass("hidden");
        $("#modal-title").removeClass("hidden").text(title);

        // Show the appropriate sections of the modal
        if (content) $("#modal-content").removeClass("hidden").text(content);
        if (buttons) {
            $("#modal-buttons").removeClass("hidden");
            for (let buttonID of buttons) {
                $(buttonID).removeClass("hidden");
            }
        }

        this.$modal.removeClass().addClass(`bg-${bg}`);

        // Hide the modal after 700ms
        if (!buttons) {
            setTimeout(() => this.$modal.removeClass().addClass("hidden"), 700);
        }
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
}

export default Game;