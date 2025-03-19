const express = require("express");

const { uploadImage, removeImage } = require("../controllers/util.controller");
const upload = require("../middleware/upload");
const { requireAuth } = require("../middleware/require-auth");
const { ROLES } = require("../constants/roles");

const router = express.Router();

router.post(
  "/upload-image",
  requireAuth([ROLES.ADMIN]),
  upload.single("image"),
  uploadImage
);
router.post("/delete-image", requireAuth([ROLES.ADMIN]), removeImage);

module.exports = router;
