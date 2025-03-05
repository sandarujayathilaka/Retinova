const express = require("express");
const {
  uploadImage,
  getPatientHistory,
  predictAndFetch,
  uploadImages,
  multiImageSave,
  saveMultipleDiagnoses,
} = require("../controllers/patientController");
const upload = require("../middleware/upload");

const router = express.Router();

// **Upload Image & Get Diagnosis**
router.post("/upload", upload.single("image"), uploadImage);
router.post("/multiupload", upload.array("files", 10), uploadImages);
router.post("/multisave", upload.array("files", 10), multiImageSave);
router.post("/predict", upload.single("file"), predictAndFetch);
router.post("/multiDataSave", upload.array("files", 10), saveMultipleDiagnoses);

// **Get Patient Diagnosis History**
router.get("/:patientId/history", getPatientHistory);

module.exports = router;
