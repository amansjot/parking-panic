class StatsManager {
    #lives;
    #rounds;
    #score;
    #time;

    constructor() {
        // Lives-related variables
        this.#lives = 0;

        // Rounds-related variables
        this.#rounds = 1;
        this.$round = $("#round-display");

        // Score-related variables
        this.#score = 0;

        // Timer-related variables
        this.#time = 0; // Start the timer at 0
        this.$timer = $("#timer-display");
        this.timerInterval = null;
    }

    // -------- Lives Management --------
    getLives() {
        return this.#lives;
    }

    resetLives(gameState) {
        // Change life count based on mode
        this.#lives = (gameState === "easy-mode") ? 5 : 3;

        // Clear existing life icons
        $("#lives-counter").empty();

        for (let i = 0; i < this.#lives; i++) {
            $("<div class='game-life'><img src='./img/hud/life-icon.png' alt='Life'></div>")
                .appendTo("#lives-counter");
        }
    }

    removeLife() {
        let $lives = $(".game-life");
        if ($lives.length == this.#lives) {
            $lives[this.#lives - 1].remove(); // Remove the last life icon
        }

        this.#lives -= 1; // Decrease life count
    }

    // -------- Rounds Management --------
    getRounds() {
        return this.#rounds;
    }

    increaseRounds() {
        this.#rounds += 1;
        this.$round.text("Round " + this.#rounds);
    }

    resetRounds() {
        this.#rounds = 1;
        this.$round.text("Round " + this.#rounds);
    }

    // -------- Score Management --------
    getScore() {
        return this.#score;
    }

    updateScore(mode) {
        // Double points for hard mode
        let roundScore = (mode === "easy-mode") ? 1000 : 2000;

        // Lose 5 points every second after the first 5 seconds
        if (this.#time > 5) {
            roundScore = Math.max(roundScore / 2, roundScore - 5 * (this.#time - 5));
        }

        // Add to total score
        this.#score += Math.round(roundScore);
    }

    resetScore() {
        this.#score = 0;
    }

    // -------- Timer Management --------
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${secs}`;
    }

    updateTimer() {
        if (this.#time < 3600) {
            this.#time += 1;
            this.$timer.text(this.formatTime(this.#time));
        }
    }

    startTimer() {
        if (!this.timerInterval) {
            this.$timer.show();
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetTimer() {
        this.#time = 0;
        this.$timer.text(this.formatTime(this.#time));
    }

    // -------- Stats Management --------
    resetStats(gameState) {
        this.resetLives(gameState);
        this.resetScore();
        this.resetRounds();
    }
}

export default StatsManager;
