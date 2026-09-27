// backend/src/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadRoot = path.resolve(__dirname, "../../uploads");
const uploadDirectories = {
  gn_officers: path.join(uploadRoot, "gn_officers"),
  citizens: path.join(uploadRoot, "citizens"),
  certificates: path.join(uploadRoot, "certificates"),
  announcements: path.join(uploadRoot, "announcements"),
};

Object.values(uploadDirectories).forEach((directory) => {
  fs.mkdirSync(directory, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const routePath = `${req.baseUrl}${req.path}`;
    let directory = uploadDirectories.citizens;
    if (routePath.includes("gn-officer")) {
      directory = uploadDirectories.gn_officers;
    }
    if (routePath.includes("certificate")) {
      directory = uploadDirectories.certificates;
    }
    if (routePath.includes("announcements")) {
      directory = uploadDirectories.announcements;
    }
    cb(null, directory);
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


// Single file for profile picture
// const uploadSingle = upload.single("profile_picture");
// const uploadCitizenPicture = uploadSingle;

// // Multiple files for certificate attachments (up to 5)
// const uploadCertificateDocs = upload.array("attachments", 5);

// Generic upload handler (single file with error handling)
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
