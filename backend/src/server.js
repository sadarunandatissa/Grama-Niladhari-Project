const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const connectDB = require("./config/db"); // ✅ relative to src/

// Import scheduler – correct path
const { startScheduler } = require("./scheduler/announcementScheduler"); // ✅ no src/

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  },
  express.static(path.join(__dirname, "../uploads")), // ✅ relative to backend root
);

// Routes – correct paths (all inside src/)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/registration", require("./routes/registrationRoutes"));
app.use("/api/citizen", require("./routes/citizenRoutes"));
app.use("/api/gn-officer", require("./routes/gnOfficerRoutes"));
app.use("/api/villages", require("./routes/villageRoutes"));
app.use("/api/land", require("./routes/landRoutes"));
app.use("/api/certificate", require("./routes/certificateRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  startScheduler();
});
