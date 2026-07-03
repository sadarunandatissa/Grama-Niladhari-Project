const express = require("express");
const router = express.Router();
const { login, getCurrentUser } = require("../controllers/authController"); // ← make sure both are imported
const { protect } = require("../middleware/auth");

// Public: Login
router.post("/login", login);

// Protected: Get current user
router.get("/me", protect, getCurrentUser);

module.exports = router;
