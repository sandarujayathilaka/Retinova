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

router.get("/getAllPatients", requireAuth([ROLES.DOCTOR]), getAllPatients);
router.get("/status", requireAuth([ROLES.DOCTOR]), getPatientsByOneStatus);
router.get(
  "/unchecked",
  requireAuth([ROLES.DOCTOR]),
  getPatientsWithUncheckedDiagnoses
);
router.get(
  "/:patientId/history",
  requireAuth([ROLES.DOCTOR]),
  getPatientHistory
);
router.get("/:patientId", requireAuth([ROLES.DOCTOR]), getPatientById);

//for mobile
router.get(
  "/my/diagnosehistory",
  requireAuth([ROLES.PATIENT, ROLES.DOCTOR]),
  getMyDiagnoseHistory
);
router.get(
  "/diagnoses/:diagnosisId",
  requireAuth([ROLES.PATIENT, ROLES.DOCTOR]),
  getDiagnosisById
);

module.exports = router;
