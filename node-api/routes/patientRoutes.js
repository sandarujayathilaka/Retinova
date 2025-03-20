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

  getMyDiagnoseHistory,
  getDiagnosisById,

} = require("../controllers/patientController");
const upload = require("../middleware/upload");
const { requireAuth } = require("../middleware/require-auth");
const { ROLES } = require("../constants/roles");

const router = express.Router();

// **Upload Image & Get Diagnosis**
router.get("/getAllPatients", requireAuth([ROLES.DOCTOR]), getAllPatients);
router.get("/status",requireAuth([ROLES.DOCTOR]),getPatientsByOneStatus);
router.get("/unchecked",requireAuth([ROLES.DOCTOR]), getPatientsWithUncheckedDiagnoses);
router.post("/upload",requireAuth([ROLES.DOCTOR]), upload.single("image"), uploadImage);
router.post("/multiupload",requireAuth([ROLES.DOCTOR]), upload.array("files", 10), uploadImages);
router.post("/multiImagePrediction",requireAuth([ROLES.DOCTOR]), upload.array("files", 10), multiImagePrediction);
router.post("/predict",requireAuth([ROLES.DOCTOR]), upload.single("file"), predictAndFetch);
router.post("/multiDataSave",requireAuth([ROLES.DOCTOR]), upload.array("files", 10), saveMultipleDiagnoses);
router.post("/onedatasave",requireAuth([ROLES.DOCTOR]), upload.single("file"), updatePatientDiagnosis);
router.put("/:patientId/diagnoses/:diagnosisId/recommendations",requireAuth([ROLES.DOCTOR]), updateDiagnosisRecommendations);
router.put("/:patientId/diagnoses/:diagnosisId/review",requireAuth([ROLES.DOCTOR]), updateDiagnosisReviewRecommendations);
router.put("/:patientId/diagnoses/:diagnosisId/tests/:testId/status",requireAuth([ROLES.DOCTOR]), updateTestStatus);
router.put("/:patientId/diagnoses/:diagnoseId/tests",requireAuth([ROLES.DOCTOR]),addTestToDiagnose);

// **Get Patient Diagnosis History**
router.get("/:patientId/history",requireAuth([ROLES.DOCTOR]), getPatientHistory);
router.get("/:patientId",requireAuth([ROLES.DOCTOR]), getPatientById);


//for mobile
router.get("/my/diagnosehistory", requireAuth([ROLES.PATIENT, ROLES.DOCTOR]), getMyDiagnoseHistory);
router.get("/diagnoses/:diagnosisId", requireAuth([ROLES.PATIENT, ROLES.DOCTOR]), getDiagnosisById);


module.exports = router;
