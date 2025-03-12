// controllers
const Patient = require("../models/patient");
const Doctor = require("../models/doctor.model");

const getAllPatients = async (req, res) => {
  try {
    const { fields, type, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let patients;
    if (type === "summary") {
      // Use aggregation to extract diagnosis and status from diagnoseHistory
      patients = await Patient.aggregate([
        {
          $project: {
            fullName: 1,
            birthDate: 1,
            createdAt: 1,
            patientStatus: 1,
            category: 1,
            "diagnoseHistory.diagnosis": 1, // Include diagnosis field
            "diagnoseHistory.status": 1,    // Include status field
            "diagnoseHistory.uploadedAt": 1, 
            diagnoseHistoryLength: { $size: "$diagnoseHistory" }, // Calculate length
          },
        },
      ]).exec();
    } else {
      // Full retrieval with pagination
      patients = await Patient.find({})
        .select(fields || "") // Use fields query param or all fields
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      const total = await Patient.countDocuments({});
      return res.status(200).json({ patients, total, page: parseInt(page), limit: parseInt(limit) });
    }

    res.status(200).json({ patients });
  } catch (error) {
    res.status(500).json({ message: "Error fetching patients", error: error.message });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const { fields, type, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let doctors;
    if (type === "summary") {
      doctors = await Doctor.find({})
        .select("name status type specialty createdAt workingHours daysOff")
        .lean();
    } else {
      doctors = await Doctor.find({})
        .select(fields || "")
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      const total = await Doctor.countDocuments({});
      return res.status(200).json({ doctors, total, page, limit });
    }

    res.status(200).json({ doctors });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
};

module.exports = { getAllPatients, getAllDoctors };