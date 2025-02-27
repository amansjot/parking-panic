const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000; // ✅ Railway dynamically assigns this

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not set. Check Railway environment variables.");
    process.exit(1);
}

// Create MongoDB client
const client = new MongoClient(MONGO_URI);

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ Connected to Railway MongoDB!");
        return client.db();
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
    }
}

connectDB();

// Example route
app.get("/", (req, res) => {
    res.send("✅ Server is running and connected to MongoDB!");
});

// ✅ Listen on process.env.PORT
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
