const express = require("express");
const router = express.Router();

const {
  addNurse,
  getNurses,
  getNurseById,
  updateNurse,
  deleteNurse,
} = require("../controllers/nurse.controller");

router.post("/", addNurse);
router.get("/", getNurses);
router.get("/:id", getNurseById);
router.put("/:id", updateNurse);
router.delete("/:id", deleteNurse);

module.exports = router;