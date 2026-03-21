import multer from "multer";
import fs from "fs";

// Upload folder
const uploadFolder = "uploads";

// Check and create folder if not exists
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder); // folder ka naam yahi use karo
  },
  filename: function (req, file, cb) {
    // Sanitize filename: remove spaces, special characters except dots and dashes
    const sanitizedFilename = file.originalname
      .replace(/\s+/g, '_')  // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9._-]/g, '')  // Remove special characters except . _ -
      .toLowerCase();  // Convert to lowercase
    
    // Generate unique filename with timestamp
    const uniqueFilename = Date.now() + "-" + sanitizedFilename;
    cb(null, uniqueFilename);
  },
});

export const upload = multer({ storage });
