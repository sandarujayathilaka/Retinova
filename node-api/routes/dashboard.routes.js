const express = require("express");
const router = express.Router();

const {
    getAllPatients, 
    getAllDoctors,
    getAllNurses
} = require("../controllers/dashboard.controller");

router.get("/doctors", getAllDoctors);
router.get("/patients", getAllPatients);
router.get("/nurses", getAllNurses);

module.exports = router;
