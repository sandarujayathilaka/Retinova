const express = require("express");
const router = express.Router();

const {
  addTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
} = require("../controllers/test.controller");

router.post("/", addTest);
router.get("/", getTests);
router.get("/:id", getTestById);
router.put("/:id", updateTest);
router.delete("/:id", deleteTest);

module.exports = router;
