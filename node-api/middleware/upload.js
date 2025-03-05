const multer = require("multer");

// Store file in memory before uploading to S3
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
