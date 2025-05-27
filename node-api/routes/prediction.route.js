const express = require("express");
const upload = require("../middleware/upload");
const { requireAuth } = require("../middleware/require-auth");
const { ROLES } = require("../constants/roles");
const { SingleImagePredictAndFetch, multiImagePrediction, updatePatientDiagnosis, updateDiagnosisRecommendations, updateDiagnosisReviewRecommendations, updateTestStatus, addTestToDiagnose, saveMultipleDiagnoses } = require("../controllers/prediction.controller");

const router = express.Router();

router.post("/multiImagePrediction",requireAuth([ROLES.DOCTOR]), upload.array("files", 10), multiImagePrediction);
router.post("/singleImagePredict",requireAuth([ROLES.DOCTOR]), upload.single("file"), SingleImagePredictAndFetch);
router.put("/savePatientDiagnose",requireAuth([ROLES.DOCTOR]), upload.single("file"), updatePatientDiagnosis);
router.post("/multiDataSave",requireAuth([ROLES.DOCTOR]), upload.array("files", 10), saveMultipleDiagnoses);
router.put("/:patientId/diagnoses/:diagnosisId/recommendations",requireAuth([ROLES.DOCTOR]), updateDiagnosisRecommendations);
router.put("/:patientId/diagnoses/:diagnosisId/review",requireAuth([ROLES.DOCTOR]), updateDiagnosisReviewRecommendations);
router.put("/:patientId/diagnoses/:diagnosisId/tests/:testId/status",requireAuth([ROLES.DOCTOR]), updateTestStatus);
router.put("/:patientId/diagnoses/:diagnoseId/tests",requireAuth([ROLES.DOCTOR]),addTestToDiagnose);



module.exports = router;
