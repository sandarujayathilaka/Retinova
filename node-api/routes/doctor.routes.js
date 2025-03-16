const express = require("express");
const router = express.Router();

const {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorsByIds,
  getDoctorPatientsSummary,
  getDoctorNames,
} = require("../controllers/doctor.controller");

router.get("/names", getDoctorNames);
router.post("/", addDoctor);
router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);
router.post("/bulk", getDoctorsByIds);
router.get("/:id/patients", getDoctorPatientsSummary);


module.exports = router;
