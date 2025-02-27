const { MongoClient } = require("mongodb");

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