const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const connectDB = require("../src/config/db");
const landRoutes = require("./routes/landRoutes");
const announcementRoutes = require("./routes/announcementRoutes");

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

//  Allow cross-origin resource loading for images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with CORS headers - CORRECT PATH
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
  express.static(path.join(__dirname, "../uploads")), //  ../../../uploads if needed
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "http://localhost:5000",
          "http://localhost:5173",
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        // Allow DevTools well-known URL
        defaultSrc: [
          "'self'",
          "http://localhost:5000/.well-known/appspecific/com.chrome.devtools.json",
        ],
      },
    },
  }),
);
// Routes
app.use("/api/auth", require("../src/routes/authRoutes"));
app.use("/api/admin", require("../src/routes/adminRoutes"));
app.use("/api/registration", require("../src/routes/registrationRoutes"));
app.use("/api/citizen", require("../src/routes/citizenRoutes"));
app.use("/api/gn-officer", require("../src/routes/gnOfficerRoutes"));
app.use("/api/villages", require("../src/routes/villageRoutes"));
app.use("/api/land", require("./routes/landRoutes"));
app.use("/api/certificate", require("./routes/certificateRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server running" });
});
const { startScheduler } = require("./src/scheduler/announcementScheduler");
app.use("/api/announcements", require("./src/routes/announcementRoutes"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
