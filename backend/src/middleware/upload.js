const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createUploadDirs = () => {
  const dirs = ["./uploads/gn_officers", "./uploads/citizens"];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
};
createUploadDirs();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = "./uploads/citizens";
    if (req.path.includes("gn-officer")) dest = "./uploads/gn_officers";
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed (JPEG, PNG, GIF, WEBP)"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
const uploadSingle = upload.single("profile_picture");

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

const uploadCitizenPicture = uploadSingle;
const uploadCertificateDocs = upload.array("documents", 5);

module.exports = {
  upload,
  handleUpload,
  uploadCitizenPicture,
  uploadCertificateDocs,
};
