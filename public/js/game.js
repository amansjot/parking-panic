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
        // Initialize event listeners
        this.addEventListeners();

        // Resize the startup screen
        if (this.resize()) {

            // Load the game
            this.loadGame();

            // Load objective video sequence
            this.initObjectiveVideos();

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

        // Alert if you try closing the tab during a game
        $(window).on("beforeunload", (e) => {
            if (this.gameState === "start" || this.gameState === "loading") return;

            e.preventDefault();
            e.returnValue = ""; // Required for the prompt
        });

        $("#fullscreen").on("click", () => this.toggleFullScreen());
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
                    confirmSkipRound: () => this.confirmSkipRound(),
                    skipRound: () => this.skipRound(),
                    authUser: () => this.authUser(),
                    discardScore: () => this.discardScore(),
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

        // Apply scale and centering to the startup and game windows
        $(".window").css({
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

        // requestAnimationFrame(() => {
        this.carManager.moveCar(this.inputManager.keys); // Move the car based on key inputs
        this.carManager.rotateCar(this.inputManager.keys); // Rotate the car
        this.carManager.updatePosition(); // Update the car's position in CSS
        // });

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

    getRandomTip() {
        // Generate a random loading tip
        var loadingTips = [
            "Press H to use headlights",
            "Press G to sound the horn",
            "Press . to pause the game",
            "Press Backspace to exit the game",
            "Press / to quick open Help at any time",
            "This game can be played at any screen size!",
            "Press L to view the leaderboard at any time",
            "If you exit a game, your score will be auto-saved to the leaderboard",
            "Pause the game to view your score",
            "In Hard Mode, each round is worth double the points!",
            "In Hard Mode, be careful - lives don't reset between rounds!",
            "You can drive around in the Start Screen before starting a game",
            "Reversing is slower than accelerating",
            "The game will auto-pause after 30 seconds of inactivity",
        ];
        return "Tip: " + loadingTips[Math.floor(Math.random() * loadingTips.length)];
    }

    loadGame() {
        // Step 1: Fade in the title text and generate the loading tip
        $("#startup-window").animate({ opacity: 1 }, 500);

        // Step 2: Quickly cycle through all background images to preload them
        setTimeout(() => $("#game-window").css("background-image", "url(./img/game-lot.png)"), 250);
        setTimeout(() => $("#game-window").css("background-image", "url(./img/starting-lot.png)"), 300);
        setTimeout(() => $("#game-window").css("background-image", "url(./img/loading-lot.png)"), 350);

        // Step 3: Fade out the startup screen at 3s and start the loading bar animation
        setTimeout(() => {
            if (this.gameState === "loading") $("#loading-container").removeClass("hidden opacity-0");
            $("#game-window").removeClass("hidden opacity-0");
            $("#fullscreen").animate({ opacity: 1 }, 500);
            $("#startup-window").animate({ opacity: 0 }, 500);
            $("#loading-tip").hide().text(this.getRandomTip()).fadeIn(400);
            $("#game-window").addClass("border-white");

            setTimeout(() => {
                $("#loading-tip").hide().text(this.getRandomTip()).fadeIn(400);
            }, 6200);

            this.initLoadingBar(12300);
        }, 2000);

        // Step 4: Transition to the main game screen after 14.5s
        setTimeout(() => {
            if (this.gameState === "loading") this.initStartScreen();
        }, 14500);
    }

    initObjectiveVideos() {
        let videos = $(".objective-video"); // Select all videos
        let currentIndex = 0; // Start with the first video

        for (let video of videos) {
            video.load(); // Load the video
            video.pause(); // Pause the video
        }

        function playNextVideo() {
            let currentVideo = videos.get(currentIndex);
            let $currentListItem = $(currentVideo).closest(".list-item"); // Get parent .list-item
            let $textElement = $currentListItem.children("div:first-child"); // Select the text div

            // Remove "active" class from all videos
            videos.removeClass("active");

            // Remove "text-yellow" class from all text elements
            $(".list-item div:first-child").removeClass("text-yellow");

            // Add "active" class to the current video
            $(currentVideo).addClass("active");

            // Add "text-yellow" class to the corresponding text
            $textElement.addClass("text-yellow");

            // Ensure video resets to first frame before playing
            currentVideo.currentTime = 0;
            currentVideo.play();

            $(currentVideo).off("ended").on("ended", function () {
                setTimeout(() => {
                    this.pause(); // Pause the video
                    this.currentTime = 0; // Reset to the first frame

                    // Move to the next video in sequence
                    currentIndex = (currentIndex + 1) % videos.length;
                    playNextVideo();
                }, 250); // Play the next video
            });
        }

        playNextVideo(); // Start the sequence
    }

    initLoadingBar(time) {
        let progress = 0;
        const startTime = performance.now(); // Track the exact start time
        const endTime = startTime + time; // Set when loading should finish

        function updateProgress() {
            const now = performance.now();
            const elapsed = now - startTime;
            progress = Math.min((elapsed / time) * 100, 100); // Ensure it never exceeds 100%

            $(".progress").css("width", progress + "%");

            if (now < endTime) {
                requestAnimationFrame(updateProgress); // Keep updating until time is reached
            }
        }

        requestAnimationFrame(updateProgress); // Start animation loop
    }

    initStartScreen() {
        $("#game-window").css("background-image", "url(./img/starting-lot.png)");
        $("#loading-container").addClass("hidden");
        $(".starting-obstacle, #start-buttons, .game-subtitle").animate({ opacity: 1 }, 400);
        $("#startup-window").remove();

        // Reset car
        this.carManager.resetCar(this.gameState);

        // The car becomes visible and drives in from the bottom
        setTimeout(() => {
            $("#car").css({ top: "120px" }).animate({ top: "0px" }, 700, "swing");
            $("#car").removeClass("opacity-0");

            this.gamePaused = false;
            this.gameState = 'start';

            // If it's the first time opening the game, show the spotlight
            if (!localStorage.getItem("firstVisit")) {
                localStorage.setItem("firstVisit", "true"); // Mark that the user has visited
                setTimeout(() => this.showSpotlight(), 1300); // Run only on first visit
            }
        }, 300);
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

        // Reset the pause icon and text
        $("#pause-play-icon").attr("src", "./img/hud/pause-icon.svg");
        $("#pause-game-tooltip").text("Pause Game");

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
    handleRoundWin(skipped = false) {
        // Stop the car
        this.gamePaused = true;
        this.carManager.stopCar();

        // Prevent explosions and trigger confetti
        this.carManager.hideExplosion();
        this.carManager.triggerConfetti();

        // Increase rounds and update the score
        this.statsManager.increaseRounds();
        if (!skipped) this.statsManager.updateScore(this.gameState);

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

            if (this.gameState === "hard-mode" && this.statsManager.getLives() === 1) {
                $("#skip-round-button").addClass("disabled");
            }

            if (this.statsManager.getLives() === 0) {
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
                const modalStr = "Log in or create an account to save your score!<br><br>Warning: This cannot be changed.";
                this.showModal("yellow", "Save Score", modalStr, ["#auth-user", "#discard-name"], true);
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
                $("#pause-game-tooltip").text("Resume Game");
                this.statsManager.stopTimer();
                this.showModal("yellow", "Game Paused", `Current score: ${this.statsManager.getScore()}`, ["#resume-game", "#confirm-exit-game"]);
            } else {
                $("#pause-play-icon").attr("src", "./img/hud/pause-icon.svg");
                $("#pause-game-tooltip").text("Pause Game");
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

            if (!this.leaderboard.playerName) {
                this.gameOver();
                return;
            }

            let modalStr = `Your score (${currScore}) will not be saved.`;
            if (this.leaderboard.getLowestScore() <= currScore) {
                modalStr = `Your score (${currScore}) will be added to the leaderboard.`;
            }

            this.showModal("yellow", "Exit Game?", modalStr, ["#exit-game", "#cancel-action"]);
        } else if (this.gameState !== "start") {
            this.exitGame();
        }
    }

    confirmSkipRound() {
        if (this.gameEnded) return;

        if (!($("#skip-round-button").hasClass("disabled"))) {
            this.gamePaused = true;
            this.statsManager.stopTimer();

            let modalStr = "This will cost 1 life and earn you 0 points.";
            if (this.gameState === "easy-mode") {
                const currMaxLives = this.statsManager.maxLives['easy-mode'];
                modalStr = `Your lives will reset to ${currMaxLives - 1} and you will earn 0 points for this round.`;
            }

            this.showModal("yellow", "Skip Round?", modalStr, ["#skip-round", "#cancel-action"]);
        }
    }

    skipRound() {
        if (this.gameState === "easy-mode") {
            const currMaxLives = this.statsManager.maxLives['easy-mode'];
            this.statsManager.maxLives["easy-mode"] = currMaxLives - 1;

            if (this.statsManager.maxLives['easy-mode'] === 1) {
                $("#skip-round-button").addClass("disabled");
            }
        } else {
            this.statsManager.removeLife();

            if (this.statsManager.getLives() === 1) $("#skip-round-button").addClass("disabled");
        }

        this.handleRoundWin(true);
    }

    showModal(textColor, title, content = null, buttons = null, inputs = false) {
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

        if (inputs) {
            $("#modal-input").removeClass("hidden");
            setTimeout(() => $("#modal-input > input").first().focus(), 100);
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

            setTimeout(() => {
                $("#car-spotlight").animate({ width: "10000px", height: "10000px" }, 2000, function () {
                    // After animation completes, reset size and hide
                    $(this).css({ width: "200px", height: "200px" }).addClass("hidden");
                });
            }, 1000);
        }, 1500);
    }

    async authUser() {
        const username = $("#player-username").val().trim();
        const password = $("#player-password").val().trim();
        
        const score = this.statsManager.getScore();
    
        try {
            // ✅ Await the authentication response
            const errors = await this.leaderboard.authUser(username, password);
    
            if (errors.error) {
                $("#input-error").html(errors.error);
                return;
            }
    
            if (!errors.username && !errors.password && !errors.error) {
                this.leaderboard.addScore(score, username);
                let scoreStr = `Score: ${score}`;
                if (this.leaderboard.getLowestScore() <= score) {
                    scoreStr += "<br><br>Your score has been added to the leaderboard!";
                }
                this.showModal("red", "Game Over!", scoreStr, ["#play-again", "#exit-game"]);
            } else {
                if (errors.username) {
                    $("#player-username").addClass("input-invalid").val("");
                }
                if (errors.password) {
                    $("#player-password").addClass("input-invalid").val("");
                }
                $(".input-invalid").first().focus();
            }
        } catch (error) {
            console.error("❌ Authentication failed:", error);
            $("#input-error").html("Authentication error. Please try again.");
        }
    }    

    discardScore() {
        const score = this.statsManager.getScore();

        $("#player-name").removeClass("input-invalid");
        this.showModal("red", "Game Over!", `Score: ${score}`, ["#play-again", "#exit-game"]);
    }

    toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            $("#fullscreen img").attr("src", "./img/window-shrink.png");
        } else {
            document.exitFullscreen();
            $("#fullscreen img").attr("src", "./img/window-expand.png");
        }
    }
}

export default Game;