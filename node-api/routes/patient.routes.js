const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(),limits: { fileSize: 10 * 1024 * 1024 }, });
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
const {
    addPatient, 
    editPatient,
    getAllPatients,
    getPatientsByStatus,
    getPatient,
    deletePatient,
    getmedicalHistory,
    addmedicalHistory,
    getmedicalHistoryFiles,
    updateMedicalHistory,
    getPatientCount,
    getPatientCountsForMonth,
    updatePatientRevisit,
    deletemedicalHistory,
    uploadMedicalHistoryImage,
} = require("../controllers/patient.controller");
// const upload = require("../middleware/upload");

router.post("/add", addPatient);

router.get("/", getPatientsByStatus);
router.get("/all-patients", getAllPatients);
router.get("/count", getPatientCount);
// router.get("/patients", getAllPatients);
router.get("/:patientId", getPatient); 
router.put("/edit/:patientId", editPatient);
router.delete("/delete/:patientId", deletePatient); 
router.put("/:patientId/revisit", updatePatientRevisit);

router.get("/counts", getPatientCountsForMonth);
router.post("/:patientId/medical-records/upload", upload.single("image"), uploadMedicalHistoryImage);
router.get("/:patientId/medical-records", getmedicalHistory);
router.post("/:patientId/medical-records", upload.any(), addmedicalHistory);
router.get("/:patientId/medical-records/:recordId/files", getmedicalHistoryFiles);
router.put("/:patientId/medical-records/:recordId", upload.any(), updateMedicalHistory);
router.delete("/:patientId/medical-records/:recordId", deletemedicalHistory);
module.exports = router;
