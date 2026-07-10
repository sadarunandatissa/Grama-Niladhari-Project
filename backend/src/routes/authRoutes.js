const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");
const { limiter } = require("../middleware/rateLimiter");

router.post("/login", limiter, login);

module.exports = router;
