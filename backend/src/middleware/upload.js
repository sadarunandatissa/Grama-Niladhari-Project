// backend/src/middleware/upload.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const dirs = [
  "./uploads/gn_officers",
  "./uploads/citizens",
  "./uploads/certificates",
  "./uploads/announcements",
];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = "./uploads/citizens";
    if (req.path.includes("gn-officer")) dest = "./uploads/gn_officers";
    if (req.path.includes("certificate")) dest = "./uploads/certificates";
    if (req.path.includes("announcements")) dest = "./uploads/announcements";
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDFs are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

// ─── Middleware exports ──────────────────────────────────
const uploadCitizenPicture = upload.single("profile_picture");
const uploadCertificateDocs = upload.array("attachments", 5);
const uploadAnnouncementAttachments = upload.array("attachments", 5); // ✅ NEW

const handleUpload = (req, res, next) => {
  uploadCitizenPicture(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ success: false, message: "File too large (max 5MB)" });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = {
  upload,
  handleUpload,
  uploadCitizenPicture,
  uploadCertificateDocs,
  uploadAnnouncementAttachments, // ✅ EXPORTED
};
