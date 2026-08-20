const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    "./uploads/gn_officers",
    "./uploads/citizens",
    "./uploads/certificates",
  ];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
};
createUploadDirs();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = "./uploads/citizens";
    if (req.path.includes("gn-officer")) dest = "./uploads/gn_officers";
    if (req.path.includes("certificate")) dest = "./uploads/certificates";
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

// Single file for profile picture
const uploadSingle = upload.single("profile_picture");
const uploadCitizenPicture = uploadSingle;

// Multiple files for certificate attachments (up to 5)
const uploadCertificateDocs = upload.array("attachments", 5);

// Generic upload handler (single file with error handling)
const handleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
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
  uploadAnnouncementAttachments,
};
