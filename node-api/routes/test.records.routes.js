const express = require("express");
const router = express.Router();
const { 
    getTestRecords, 
    uploadTestAttachment, 
    updateTestStatus, 
    completeDiagnosis 
} = require("../controllers/test.records.controller");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { requireAuth } = require("../middleware/require-auth");
const { ROLES } = require("../constants/roles");

router.get("/:patientId/test-records", requireAuth([ROLES.NURSE, ROLES.ADMIN]), getTestRecords);
router.post("/upload-test", requireAuth([ROLES.NURSE, ROLES.ADMIN]), upload.single("file"), uploadTestAttachment);
router.put("/update-test", requireAuth([ROLES.NURSE, ROLES.ADMIN]), updateTestStatus);
router.put("/:patientId/complete-diagnosis", requireAuth([ROLES.NURSE, ROLES.ADMIN]), completeDiagnosis);

module.exports = router;