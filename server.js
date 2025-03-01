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
    try {
        const users = db.collection("users");

        // Aggregate top scores from all users
        const leaderboard = await users.aggregate([
            { $unwind: "$scores" },  // Flatten scores array
            { $sort: { "scores.score": -1 } },  // Sort by highest score
            { $limit: 10 },  // Limit to top 10 scores
            {
                $project: {
                    _id: 0,
                    username: "$username",
                    score: "$scores.score",
                    date: "$scores.date"
                }
            }
        ]).toArray();

        res.json({ success: true, scores: leaderboard });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
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
