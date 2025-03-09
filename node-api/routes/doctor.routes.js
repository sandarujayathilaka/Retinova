const express = require("express");
const router = express.Router();

const {
    getDoctorsByIds
} = require("../controllers/doctor.controller");


router.post("/bulk", getDoctorsByIds);

module.exports = router;
