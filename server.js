const express = require("express");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use(express.json()); // Parse JSON body

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not set. Check Railway environment variables.");
    process.exit(1);
}

// Connect to MongoDB
const client = new MongoClient(MONGO_URI);
let db;
async function connectDB() {
    try {
        await client.connect();
        db = client.db();
        console.log("✅ Connected to Railway MongoDB!");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
    }
}
connectDB();

// Route to retrieve top scores
app.get("/top-scores", async (req, res) => {
    const { username } = req.query; // Get username from query param

    try {
        const users = db.collection("users");

        // Fetch top 10 scores
        const topScores = await users.aggregate([
            { $unwind: "$scores" },
            { $sort: { "scores.score": -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 0,
                    username: "$username",
                    score: "$scores.score",
                    date: "$scores.date"
                }
            }
        ]).toArray();

        // Fetch user’s best score and rank
        let userRank = null;
        let userScore = null;

        if (username) {
            const allScores = await users.aggregate([
                { $unwind: "$scores" },
                { $sort: { "scores.score": -1 } },
                {
                    $project: {
                        _id: 0,
                        username: "$username",
                        score: "$scores.score"
                    }
                }
            ]).toArray();

            // Find user's best score
            const userEntry = allScores.find(entry => entry.username === username);
            if (userEntry) {
                userScore = userEntry.score;
                userRank = allScores.findIndex(entry => entry.username === username) + 1;
            }
        }

        res.json({ success: true, scores: topScores, userRank, userScore });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Route to get the lowest score in the leaderboard list
app.get("/lowest-score", async (req, res) => {
    try {
        const users = db.collection("users");

        // Fetch the 10th highest score from the leaderboard
        const lowestScoreEntry = await users.aggregate([
            { $unwind: "$scores" },
            { $sort: { "scores.score": -1 } }, // Sort by highest score
            { $skip: 9 }, // Skip top 9 scores
            { $limit: 1 }, // Get the 10th score
            { $project: { _id: 0, score: "$scores.score" } }
        ]).toArray();

        const lowestScore = lowestScoreEntry.length > 0 ? lowestScoreEntry[0].score : 0;

        res.json({ success: true, lowestScore });
    } catch (error) {
        console.error("❌ Error fetching lowest score:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Route to retrieve a user's best score and rank
app.get("/user-score", async (req, res) => {
    const { username } = req.query;
    
    if (!username) {
        return res.status(400).json({ success: false, message: "Username is required" });
    }
    
    try {
        const users = db.collection("users");

        // Retrieve all scores from all users, sorted in descending order
        const allScores = await users.aggregate([
            { $unwind: "$scores" },
            { $sort: { "scores.score": -1 } },
            { $project: { _id: 0, username: "$username", score: "$scores.score" } }
        ]).toArray();

        // Find the first occurrence of the given user's score (their best score)
        const userEntry = allScores.find(entry => entry.username === username);

        if (!userEntry) {
            return res.status(404).json({ success: false, message: "User not found or no scores available" });
        }

        // The rank is determined by the index of the first occurrence + 1
        const rank = allScores.findIndex(entry => entry.username === username) + 1;

        res.json({ success: true, score: userEntry.score, rank });
    } catch (error) {
        console.error("Error fetching user score:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Combined Login & Register Route
app.post("/auth", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    try {
        const users = db.collection("users");

        // Check if user already exists
        const existingUser = await users.findOne({ username });

        if (existingUser) {
            // Attempt login (Compare hashed password)
            const isValidPassword = await bcrypt.compare(password, existingUser.password);
            if (!isValidPassword) {
                return res.status(401).json({ success: false, message: "Invalid password" });
            }
            return res.json({ success: true, message: "Login successful" });
        } else {
            // Register new user (Hash password)
            const hashedPassword = await bcrypt.hash(password, 10);
            await users.insertOne({
                username,
                password: hashedPassword,
                scores: []
            });
            return res.json({ success: true, message: "User registered" });
        }
    } catch (error) {
        console.error("Authentication Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post("/add-score", async (req, res) => {
    const { username, score } = req.body;

    if (!username || score == null) {
        return res.status(400).json({ success: false, message: "Username and score are required" });
    }

    try {
        const users = db.collection("users");

        // Check if user exists
        const existingUser = await users.findOne({ username });

        if (!existingUser) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Update user's scores array
        await users.updateOne(
            { username },
            { $push: { scores: { score, date: new Date().toISOString() } } }
        );

        res.json({ success: true, message: "Score added successfully" });
    } catch (error) {
        console.error("Error adding score:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
