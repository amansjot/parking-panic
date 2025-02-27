const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI is not set. Check Railway environment variables.");
    process.exit(1);
}

// Connect to MongoDB
const client = new MongoClient(MONGO_URI);
async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to Railway MongoDB!");
        return client.db();
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
}
connectDB();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Load `index.html` when visiting `/`
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
