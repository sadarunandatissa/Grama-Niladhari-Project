// backend/src/config/db.js

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Wait 5s for server selection
      socketTimeoutMS: 45000, // Close sockets after 45s inactivity
      connectTimeoutMS: 10000, // Connection timeout
      retryWrites: true,
      w: "majority",
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
