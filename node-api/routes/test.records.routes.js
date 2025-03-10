// const express = require("express");
// const router = express.Router();
// const testRecController = require("../controllers/test.records.controller");
// const multer = require("multer");
// const upload = multer({ storage: multer.memoryStorage() });

// router.get("/:patientId/test-records", testRecController.getTestRecords);
// router.post("/upload-test", upload.single("file"), testRecController.uploadTestAttachment);
// router.put("/update-test", testRecController.updateTestStatus);

// module.exports = router;


const express = require("express");
const router = express.Router();
const testRecController = require("../controllers/test.records.controller");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.get("/:patientId/test-records", testRecController.getTestRecords);
router.post("/upload-test", upload.single("file"), testRecController.uploadTestAttachment);
router.put("/update-test", testRecController.updateTestStatus);
router.put("/:patientId/complete-diagnosis", testRecController.completeDiagnosis);

module.exports = router;