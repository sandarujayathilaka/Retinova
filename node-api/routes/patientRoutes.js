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

  getMyDiagnoseHistory,
  getDiagnosisById,

} = require("../controllers/patientController");
const upload = require("../middleware/upload");
const { requireAuth } = require("../middleware/require-auth");
const { ROLES } = require("../constants/roles");


const router = express.Router();

// **Upload Image & Get Diagnosis**
router.post("/upload", upload.single("image"), uploadImage);
router.post("/multiupload", upload.array("files", 10), uploadImages);
router.post("/multisave", upload.array("files", 10), multiImageSave);
router.post("/predict", upload.single("file"), predictAndFetch);
router.post("/multiDataSave", upload.array("files", 10), saveMultipleDiagnoses);
router.post("/onedatasave", upload.single("file"), updatePatientDiagnosis);
router.get("/status",getPatientsByOneStatus);
router.get("/:patientId", getPatientById);
router.get("/unchecked", getPatientsWithUncheckedDiagnoses);
router.put("/:patientId/diagnoses/:diagnosisId/recommendations", updateDiagnosisRecommendations);
router.put("/:patientId/diagnoses/:diagnosisId/review", updateDiagnosisReviewRecommendations);
router.put("/:patientId/diagnoses/:diagnosisId/tests/:testId/status", updateTestStatus);

// **Get Patient Diagnosis History**
router.get("/:patientId/history", getPatientHistory);
router.get("/:patientId/diagnoses/:diagnosisId", getDiagnosisById);
router.get("/getAllPatients", getAllPatients);

//for mobile
router.get("/my/diagnosehistory", requireAuth([ROLES.PATIENT, ROLES.DOCTOR]), getMyDiagnoseHistory);
router.get("/diagnoses/:diagnosisId", requireAuth([ROLES.PATIENT, ROLES.DOCTOR]), getDiagnosisById);


module.exports = router;
