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
  getDoctorByUserId,
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
router.post("/bulk", requireAuth([ROLES.DOCTOR,ROLES.NURSE]), getDoctorsByIds);
router.get("/:id/patients",requireAuth([ROLES.DOCTOR,ROLES.NURSE]), getDoctorPatientsSummary);
router.get("/user/:id/patients",requireAuth([ROLES.DOCTOR,ROLES.NURSE]), getDoctorByUserId);

module.exports = router;
