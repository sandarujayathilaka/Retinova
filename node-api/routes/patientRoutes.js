const express = require("express");
const {
  uploadImage,
  getPatientHistory,
  predictAndFetch,
  uploadImages,
  multiImageSave,
  saveMultipleDiagnoses,
  updatePatientDiagnosis,
  getAllPatients,
  getPatientById,
  getPatientsWithUncheckedDiagnoses,
  getPatientsByOneStatus,
  updateDiagnosisRecommendations,
  updateDiagnosisReviewRecommendations,
  updateTestStatus,
  addTestToDiagnose,
  multiImagePrediction,
} = require("../controllers/patientController");
const upload = require("../middleware/upload");

const router = express.Router();

// **Upload Image & Get Diagnosis**
router.get("/getAllPatients", getAllPatients);
router.get("/status",getPatientsByOneStatus);
router.get("/:patientId", getPatientById);
router.get("/unchecked", getPatientsWithUncheckedDiagnoses);
router.post("/upload", upload.single("image"), uploadImage);
router.post("/multiupload", upload.array("files", 10), uploadImages);
router.post("/multiImagePrediction", upload.array("files", 10), multiImagePrediction);
router.post("/predict", upload.single("file"), predictAndFetch);
router.post("/multiDataSave", upload.array("files", 10), saveMultipleDiagnoses);
router.post("/onedatasave", upload.single("file"), updatePatientDiagnosis);
router.put("/:patientId/diagnoses/:diagnosisId/recommendations", updateDiagnosisRecommendations);
router.put("/:patientId/diagnoses/:diagnosisId/review", updateDiagnosisReviewRecommendations);
router.put("/:patientId/diagnoses/:diagnosisId/tests/:testId/status", updateTestStatus);
router.put("/:patientId/diagnoses/:diagnoseId/tests",addTestToDiagnose);

// **Get Patient Diagnosis History**
router.get("/:patientId/history", getPatientHistory);


module.exports = router;
