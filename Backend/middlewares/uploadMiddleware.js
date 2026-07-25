const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Temp folder for incoming uploads before they are pushed to Cloudinary.
// handleUpdateProfile reads req.file.path and unlinks it after upload.
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

module.exports = upload;
