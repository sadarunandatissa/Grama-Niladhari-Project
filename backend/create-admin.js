// create-admin.js

// 1. Import required libraries
const mongoose = require("mongoose"); // MongoDB ODM – connects and saves data
const bcrypt = require("bcryptjs"); // Hashing library – hashes the password
require("dotenv").config(); // Loads .env file so we can use MONGODB_URI

// 2. Import the Admin model (our schema definition)
const Admin = require("./src/models/Admin");

// 3. Define an async function to create the admin
const createAdmin = async () => {
  try {
    // 4. Connect to MongoDB using the URI from .env
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // 5. Define the admin credentials
    const email = "admin@gnsystem.com";
    const plainPassword = "Admin@123";

    // 6. Hash the password (10 salt rounds)
    //    bcrypt.hash() creates a secure irreversible hash
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 7. Create a new Admin document using the Mongoose model
    const admin = new Admin({
      email: email,
      password_hash: hashedPassword,
      full_name: "System Administrator",
      is_active: true,
    });

    // 8. Save the admin to the database
    //    Mongoose will validate the data against the schema
    await admin.save();

    // 9. Success message with credentials
    console.log("✅ Admin created successfully!");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", plainPassword);

    // 10. Exit the script with success code (0)
    process.exit(0);
  } catch (error) {
    // If any error occurs (e.g., duplicate email, connection failure)
    console.error("❌ Error creating admin:", error.message);
    // Exit with failure code (1)
    process.exit(1);
  }
};

// 11. Call the function
createAdmin();
