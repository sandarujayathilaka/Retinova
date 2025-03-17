const Patient = require("../models/patient");
const Doctor = require("../models/doctor.model");
const Nurse = require("../models/nurse.model");
const logger = require("../config/logger");




const getAllPatients = async (req, res) => {
  try {
    const { fields, type } = req.query;

    // Sanitize fields (if provided) to prevent injection
    const safeFields = fields ? fields.replace(/[^a-zA-Z0-9\s-_]/g, '') : null;

    let patients;
    if (type === "summary") {
      // Use aggregation to extract diagnoseHistory
      patients = await Patient.aggregate([
        {
          $project: {
            fullName: 1,
            birthDate: 1,
            createdAt: 1,
            patientStatus: 1,
            category: 1,
            nextVisit: 1,
            "diagnoseHistory.diagnosis": 1, 
            "diagnoseHistory.status": 1,   
            "diagnoseHistory.uploadedAt": 1,
            diagnoseHistoryLength: { $size: { $ifNull: ["$diagnoseHistory", []] } },
          },
        },
      ]).exec();
    } else {

      patients = await Patient.find({})
        .select(safeFields || "-__v") 
        .lean();
    }

    // Total count is just the length of the returned patients
    const total = patients.length;

    return res.status(200).json({ patients, total });
  } catch (error) {
    res.status(500).json({ message: "Error fetching patients", error: error.message });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const { fields, type } = req.query;

    // Sanitize fields (if provided) to prevent injection
    const safeFields = fields ? fields.replace(/[^a-zA-Z0-9\s-_]/g, '') : null;

    let doctors;
    if (type === "summary") {
      doctors = await Doctor.find({})
        .select("name status type specialty createdAt workingHours daysOff")
        .lean();
    } else {
      doctors = await Doctor.find({})
        .select(safeFields || "-__v")
        .lean();
    }

    // Total count is just the length of the returned doctors
    const total = doctors.length;

    return res.status(200).json({ doctors, total });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
};

const getAllNurses = async (req, res) => {
  try {
    const { fields, type } = req.query;

    // Sanitize fields (if provided) to prevent injection
    const safeFields = fields ? fields.replace(/[^a-zA-Z0-9\s-_]/g, '') : null;

    let nurses;
    if (type === "summary") {
      nurses = await Nurse.find({})
        .select("name status type specialty createdAt workingHours daysOff")
        .lean();
    } else {
      nurses = await Nurse.find({})
        .select(safeFields || "-__v")
        .lean();
    }

    // Total count is just the length of the returned doctors
    const total = nurses.length;

    return res.status(200).json({ nurses, total });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
};
module.exports = { getAllPatients, getAllDoctors,getAllNurses };