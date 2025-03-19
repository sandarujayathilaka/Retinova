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
} = require("../controllers/ophthalmic.patient.controller");

// const upload = require("../middleware/upload");
const { requireAuth } = require("../middleware/require-auth");
const { ROLES } = require("../constants/roles");

router.post("/add", addPatient);

router.get("/", requireAuth([ROLES.ADMIN,ROLES.NURSE,ROLES.DOCTOR]), getPatientsByStatus);
router.get("/all-patients",requireAuth([ROLES.ADMIN,ROLES.NURSE,ROLES.DOCTOR]),  getAllPatients);
router.get("/count",requireAuth([ROLES.ADMIN,ROLES.NURSE,ROLES.DOCTOR]), getPatientCount);
// router.get("/patients", getAllPatients);
router.get("/:patientId",requireAuth([ROLES.ADMIN,ROLES.NURSE,ROLES.DOCTOR]), getPatient); 
router.put("/edit/:patientId",requireAuth([ROLES.NURSE]), editPatient);
router.delete("/delete/:patientId",requireAuth([ROLES.ADMIN]), deletePatient); 
router.put("/:patientId/revisit",requireAuth([ROLES.NURSE]), updatePatientRevisit);

router.get("/counts", requireAuth([ROLES.ADMIN,ROLES.NURSE,ROLES.DOCTOR]),getPatientCountsForMonth);
router.post("/:patientId/medical-records/upload",requireAuth([ROLES.NURSE]), upload.single("image"), uploadMedicalHistoryImage);
router.get("/:patientId/medical-records",requireAuth([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE]), getmedicalHistory);
router.post("/:patientId/medical-records",requireAuth([ROLES.NURSE]), upload.any(), addmedicalHistory);
router.get("/:patientId/medical-records/:recordId/files",requireAuth([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE]), getmedicalHistoryFiles);
router.put("/:patientId/medical-records/:recordId", requireAuth([ROLES.NURSE]),upload.any(), updateMedicalHistory);
router.delete("/:patientId/medical-records/:recordId", requireAuth([ROLES.NURSE]), deletemedicalHistory);
module.exports = router;
