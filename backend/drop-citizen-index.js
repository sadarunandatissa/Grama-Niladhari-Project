const mongoose = require("mongoose");
require("dotenv").config();

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const collection = mongoose.connection.collection("citizens");
    await collection.dropIndex("username_1");
    console.log("✅ Index username_1 dropped from citizens collection.");
    process.exit(0);
  } catch (err) {
    if (err.code === 27) {
      console.log("ℹ️ Index username_1 does not exist.");
    } else {
      console.error("❌ Error:", err.message);
    }
    process.exit(1);
  }
};
dropIndex();
