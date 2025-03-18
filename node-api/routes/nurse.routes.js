const express = require("express");
const router = express.Router();

const {
  addNurse,
  getNurses,
  getNurseById,
  updateNurse,
  deleteNurse,
} = require("../controllers/nurse.controller");
const { requireAuth } = require("../middleware/require-auth");
const { ROLES } = require("../constants/roles");

router.post("/", requireAuth([ROLES.ADMIN]), addNurse);
router.get(
  "/",
  requireAuth([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE]),
  getNurses
);
router.get(
  "/:id",
  requireAuth([ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE]),
  getNurseById
);
router.put("/:id", requireAuth([ROLES.ADMIN]), updateNurse);
router.delete("/:id", requireAuth([ROLES.ADMIN]), deleteNurse);

module.exports = router;
