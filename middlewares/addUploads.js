import multer from "multer";
import path from "path";

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // uploads folder me save hoga
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
  // Allowed file extensions
  const allowedExtensions = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|webm|flv|wmv|pdf/;

  // Allowed MIME types
  const allowedMimeTypes = /image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|quicktime|x-msvideo|x-matroska|webm|x-flv|x-ms-wmv)|application\/pdf/;

  const ext = path.extname(file.originalname).toLowerCase().substring(1); // Remove the dot
  const mimeType = file.mimetype;

  // Check both extension and MIME type
  if (allowedExtensions.test(ext) || allowedMimeTypes.test(mimeType)) {
    cb(null, true);
  } else {
    console.log(`Rejected file: ${file.originalname}, MIME: ${mimeType}, Ext: ${ext}`);
    cb(new Error(`Invalid file type. Allowed: images (jpg, png, gif, webp), videos (mp4, mov, avi, mkv, webm), and PDF`), false);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
    files: 20 // maximum 20 files
  },
});

export default upload;
