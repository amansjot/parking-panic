const { MongoClient } = require("mongodb");

// Railway injects MONGO_URI automatically
const MONGO_URI = process.env.MONGO_URI;

const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

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
