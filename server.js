const express = require("express");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files
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

// ✅ API Route to Register User
app.post("/register", async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ success: false, message: "Username is required" });
    }

    try {
        const users = db.collection("users");

        // Check if user already exists
        const existingUser = await users.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username already taken" });
        }

        // Hash a default password (optional, if you want passwords)
        const hashedPassword = await bcrypt.hash("defaultpassword", 10);

        // Insert user with empty scores array
        await users.insertOne({
            username,
            password: hashedPassword, // Use real password handling if needed
            scores: []
        });

        res.json({ success: true, message: "User registered" });
    } catch (error) {
        console.error("❌ Error registering user:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
