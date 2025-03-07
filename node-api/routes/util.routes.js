const express = require("express");

const { uploadImage, removeImage } = require("../controllers/util.controller");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/upload-image", upload.single("image"), uploadImage);
router.post("/delete-image", removeImage);

module.exports = router;
