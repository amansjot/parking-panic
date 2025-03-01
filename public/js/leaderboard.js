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
    async getLowestScore() {
        try {
            const response = await fetch("/lowest-score");
            const data = await response.json();
    
            if (!data.success) {
                console.error("❌ Failed to fetch lowest score:", data.message);
                return 0;
            }
    
            return data.lowestScore ?? 0; // Return 0 if no scores exist
        } catch (error) {
            console.error("❌ Error fetching lowest score:", error);
            return 0;
        }
    }    

    /**
     * Update the leaderboard display
     */
    async updateLeaderboard() {
        const $leaderboard = $('.leaderboard-table');
        $leaderboard.empty(); // Clear existing leaderboard content
    
        try {
            // Fetch top 10 scores from the backend
            const response = await fetch("/top-scores");
            const data = await response.json();
    
            if (!data.success) {
                console.error("Failed to fetch leaderboard:", data.message);
                $leaderboard.append('<div class="overlay-content">Failed to load leaderboard.</div>');
                return;
            }
    
            const topScores = data.scores; 
            const currentUsername = localStorage.getItem('playerName'); // Get current user
    
            // Build the header row
            if (topScores.length > 0) {
                const $headerRow = $('<div class="leaderboard-row"></div>');
                $headerRow.append('<div class="leaderboard-header">#</div>');
                $headerRow.append('<div class="leaderboard-header">Player</div>');
                $headerRow.append('<div class="leaderboard-header">Score</div>');
                $leaderboard.append($headerRow);
            } else {
                $leaderboard.append('<div class="overlay-content">You have no saved scores!</div>');
            }
    
            // Append the top 10 rows
            topScores.forEach((entry, index) => {
                const isCurrentUser = entry.username === currentUsername;
                const $row = $('<div class="leaderboard-row"></div>');
                if (isCurrentUser) $row.addClass("user-row"); // Add class if current user
                $row.append(`<div class="leaderboard-item">${index + 1}</div>`);
                $row.append(`<div class="leaderboard-item">${entry.username}</div>`);
                $row.append(`<div class="leaderboard-item">${entry.score}</div>`);
                $leaderboard.append($row);
            });
    
            // Check if the user is already in the top 10
            const inTopTen = topScores.some(entry => entry.username === currentUsername);
    
            if (!inTopTen && currentUsername) {
                // Fetch the user's best score and rank from the backend
                const userScoreResponse = await fetch(`/user-score?username=${encodeURIComponent(currentUsername)}`);
                const userData = await userScoreResponse.json();
                if (userData.success) {
                    const { score, rank } = userData;
                    if (rank === 11) {
                        // User is at #11, append their row
                        const $row = $('<div class="leaderboard-row user-row"></div>'); // Add user-row class
                        $row.append(`<div class="leaderboard-item">${rank}</div>`);
                        $row.append(`<div class="leaderboard-item">${currentUsername}</div>`);
                        $row.append(`<div class="leaderboard-item">${score}</div>`);
                        $leaderboard.append($row);
                    } else if (rank > 11) {
                        // User is below #11, add an ellipsis row then their row
                        const $ellipsis = $('<div class="leaderboard-row"><div class="leaderboard-item">...</div><div class="leaderboard-item">...</div><div class="leaderboard-item">...</div></div>');
                        $leaderboard.append($ellipsis);
                        const $row = $('<div class="leaderboard-row user-row"></div>'); // Add user-row class
                        $row.append(`<div class="leaderboard-item">${rank}</div>`);
                        $row.append(`<div class="leaderboard-item">${currentUsername}</div>`);
                        $row.append(`<div class="leaderboard-item">${score}</div>`);
                        $leaderboard.append($row);
                    }
                } else {
                    console.error("Failed to fetch user score:", userData.message);
                }
            }
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