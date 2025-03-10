const express = require("express");
const router = express.Router();

const {
  createTreatment,
  getDiagnosisWithTreatments,
  getTreatmentsByPatient,
  getTreatmentsByPatientAndDiagnosis,
//   updateTreatment,
//   deleteTreatment,
} = require("../controllers/treatment.controller");


router.post("/", createTreatment);
router.get("/:patientId/diagnoses-with-treatments", getDiagnosisWithTreatments);
router.get("/:patientId", getTreatmentsByPatient);
router.get("/:patientId/:diagnosisId", getTreatmentsByPatientAndDiagnosis);
// router.put("/:id", updateTreatment);
// router.delete("/:id", deleteTreatment);

module.exports = router;
