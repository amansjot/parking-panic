class Leaderboard {
    constructor() {
        this.numScores = 10; // Number of scores to display on the leaderboard

        // Load scores and player name from localStorage or initialize them
        this.scores = JSON.parse(localStorage.getItem('leaderboardScores')) || [];
        this.playerName = localStorage.getItem('playerName') || null;

        // Initialize leaderboard
        this.updateLeaderboard();
    }

    /**
     * Register/login for the user
     */
    authUser(username, password) {
        let errors = { username: false, password: false, error: null };

        if (username && password) {
            const sanitizedUsername = $('<div>').text(username).html(); // Sanitize username
            const sanitizedPassword = $('<div>').text(password).html(); // Sanitize password

            if (sanitizedUsername && sanitizedPassword) {
                fetch("/auth", {  // Handle both login & registration
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username: sanitizedUsername, password: sanitizedPassword })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            console.log("✅ Login/Register successful:", sanitizedUsername);
                            this.playerName = sanitizedUsername;
                            localStorage.setItem('playerName', sanitizedUsername);
                        } else {
                            console.error("❌ Authentication failed:", data.message);
                            errors.error = data.message;
                            if (data.message === "Invalid password") {
                                errors.password = true;
                            } else {
                                errors.username = true;
                            }
                        }
                    })
                    .catch(error => {
                        console.error("❌ Error:", error);
                        errors.error = error;
                        errors.username = true;
                        errors.password = true;
                    });
            }
        }

        if (!password) {
            errors.password = true;
            errors.error = "Password is required";
        }
        if (!username) {
            errors.username = true;
            errors.error = "Username is required";
        }

        return errors;
    }


    /**
     * Add a score to the leaderboard.
     * @param {number} score - The player's score to add.
    */
    addScore(score, username = null) {
        // Ignore scores of 0
        if (score == 0) return;

        // Update the username after authentication
        if (username) {
            localStorage.setItem('playerName', username);
            this.playerName = username;
        }

        // Push the new score into the scores array
        this.scores.push({ name: this.playerName || "Unknown", score });

        // Sort scores in descending order
        this.scores.sort((a, b) => b.score - a.score);

        // Limit to the top n scores
        if (this.scores.length > this.numScores) {
            this.scores = this.scores.slice(0, this.numScores);
        }

        // Save updated scores
        localStorage.setItem('leaderboardScores', JSON.stringify(this.scores));
        this.updateLeaderboard();
    }

    /**
     * Get the lowest score in the leaderboard.
     */
    getLowestScore() {
        // Return 0 if there are open spots on the leaderboard
        if (this.scores.length < this.numScores) return 0;

        // Return the score of the last entry in the sorted leaderboard
        return this.scores[this.scores.length - 1].score;
    }

    /**
     * Update the leaderboard display
     */
    updateLeaderboard() {
        const $leaderboard = $('.leaderboard-table');
        $leaderboard.empty(); // Clear existing leaderboard content

        // Add leaderboard header row
        if (this.scores.length > 0) {
            const $headerRow = $('<div class="leaderboard-row"></div>');
            $headerRow.append('<div class="leaderboard-header">#</div>');
            $headerRow.append('<div class="leaderboard-header">Player</div>');
            $headerRow.append('<div class="leaderboard-header">Score</div>');
            $leaderboard.append($headerRow);
        } else {
            $leaderboard.append('<div class="overlay-content">You have no saved scores!</div>');
        }

        // Add leaderboard rows dynamically
        this.scores.forEach((entry, index) => {
            const $row = $('<div class="leaderboard-row"></div>');
            $row.append(`<div class="leaderboard-item">${index + 1}</div>`); // Rank
            $row.append(`<div class="leaderboard-item">${entry.name}</div>`); // Player Name
            $row.append(`<div class="leaderboard-item">${entry.score}</div>`); // Score
            $leaderboard.append($row);
        });
    }

    /**
     * Clear the leaderboard (for debugging or reset purposes).
     */
    resetLeaderboard() {
        this.scores = [];
        this.playerName = [];
        localStorage.removeItem('leaderboardScores');
        localStorage.removeItem('playerName');
    }
}

export default Leaderboard;