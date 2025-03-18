const express = require("express");
const router = express.Router();

const {
  addTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
} = require("../controllers/test.controller");
const { requireAuth } = require("../middleware/require-auth");
const { ROLES } = require("../constants/roles");

router.post("/", requireAuth([ROLES.ADMIN]), addTest);
router.get(
  "/",
  requireAuth([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]),
  getTests
);
router.get(
  "/:id",
  requireAuth([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]),
  getTestById
);
router.put("/:id", requireAuth([ROLES.ADMIN]), updateTest);
router.delete("/:id", requireAuth([ROLES.ADMIN]), deleteTest);

module.exports = router;
