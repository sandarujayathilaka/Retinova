const express = require("express");
const router = express.Router();

const {
    getAllPatients, 
    getAllDoctors

} = require("../controllers/dashboard.controller");

router.get("/doctors", getAllDoctors);
router.get("/patients", getAllPatients);


module.exports = router;
