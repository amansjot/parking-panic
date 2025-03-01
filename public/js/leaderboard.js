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
    async authUser(username, password) {
        let errors = { username: false, password: false, error: null };
    
        if (!username) {
            errors.username = true;
            errors.error = "Username is required";
            return errors;
        }
        if (!password) {
            errors.password = true;
            errors.error = "Password is required";
            return errors;
        }
    
        const sanitizedUsername = $('<div>').text(username).html(); // Sanitize username
        const sanitizedPassword = $('<div>').text(password).html(); // Sanitize password
    
        try {
            const response = await fetch("/auth", {  // Await API response
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: sanitizedUsername, password: sanitizedPassword })
            });
    
            const data = await response.json();
    
            if (data.success) {
                console.log("Login/Register successful:", sanitizedUsername);
                this.playerName = sanitizedUsername;
                localStorage.setItem('playerName', sanitizedUsername);
            } else {
                console.error("Authentication failed:", data.message);
                errors.error = data.message;
                if (data.message === "Invalid password") {
                    errors.password = true;
                } else {
                    errors.username = true;
                }
            }
        } catch (error) {
            console.error("Error:", error);
            errors.error = "Server error. Please try again.";
        }
    
        return errors;
    }
    


    /**
     * Add a score to the leaderboard.
     * @param {number} score - The player's score to add.
    */
    async addScore(score) {
        // Ignore scores of 0
        if (score == 0) return;
    
        const username = this.playerName || "Unknown";
    
        try {
            // Send score to backend
            const response = await fetch("/add-score", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, score })
            });
    
            const data = await response.json();
    
            if (data.success) {
                console.log(`Score saved: ${score} for ${username}`);
            } else {
                console.error("Failed to save score:", data.message);
            }
        } catch (error) {
            console.error("Error saving score:", error);
        }
    
        // Update local leaderboard for immediate UI update
        this.scores.push({ name: username, score });
    
        // Sort scores in descending order
        this.scores.sort((a, b) => b.score - a.score);
    
        // Limit to the top n scores
        if (this.scores.length > this.numScores) {
            this.scores = this.scores.slice(0, this.numScores);
        }
    
        // Save updated scores locally
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
    async updateLeaderboard() {
        const $leaderboard = $('.leaderboard-table');
        $leaderboard.empty(); // Clear existing leaderboard content
    
        try {
            // Fetch top scores from backend
            const response = await fetch("/top-scores");
            const data = await response.json();
    
            if (!data.success) {
                console.error("Failed to fetch leaderboard:", data.message);
                $leaderboard.append('<div class="overlay-content">Failed to load leaderboard.</div>');
                return;
            }
    
            const scores = data.scores;
    
            if (scores.length > 0) {
                const $headerRow = $('<div class="leaderboard-row"></div>');
                $headerRow.append('<div class="leaderboard-header">#</div>');
                $headerRow.append('<div class="leaderboard-header">Player</div>');
                $headerRow.append('<div class="leaderboard-header">Score</div>');
                $leaderboard.append($headerRow);
            } else {
                $leaderboard.append('<div class="overlay-content">You have no saved scores!</div>');
            }
    
            // Dynamically populate leaderboard
            scores.forEach((entry, index) => {
                const $row = $('<div class="leaderboard-row"></div>');
                $row.append(`<div class="leaderboard-item">${index + 1}</div>`); // Rank
                $row.append(`<div class="leaderboard-item">${entry.username}</div>`); // Player Name
                $row.append(`<div class="leaderboard-item">${entry.score}</div>`); // Score
                $leaderboard.append($row);
            });
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            $leaderboard.append('<div class="overlay-content">Failed to load leaderboard.</div>');
        }
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