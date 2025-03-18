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
  getDoctorsForRevisit,
} = require("../controllers/doctor.controller");
const { requireAuth } = require("../middleware/require-auth");
const { ROLES } = require("../constants/roles");

router.get("/names", getDoctorNames);
router.get("/for-revisit", getDoctorsForRevisit);
router.post("/", requireAuth([ROLES.ADMIN]), addDoctor);
router.get(
  "/",
  requireAuth([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]),
  getDoctors
);
router.get(
  "/:id",
  requireAuth([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]),
  getDoctorById
);
router.put("/:id", requireAuth([ROLES.ADMIN]), updateDoctor);
router.delete("/:id", requireAuth([ROLES.ADMIN]), deleteDoctor);
router.post("/bulk", getDoctorsByIds);
router.get("/:id/patients", getDoctorPatientsSummary);

module.exports = router;
