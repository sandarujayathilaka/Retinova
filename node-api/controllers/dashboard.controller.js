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
      // Use aggregation to include doctor name with $lookup
      patients = await Patient.aggregate([
        {
          $lookup: {
            from: "doctors", // The name of the Doctor collection (lowercase, pluralized by Mongoose)
            localField: "doctorId", // Field in Patient referencing Doctor
            foreignField: "_id", // Field in Doctor collection (_id is the default primary key)
            as: "doctorInfo", // Output array field where doctor data will be stored
          },
        },
        {
          $unwind: {
            path: "$doctorInfo",
            preserveNullAndEmptyArrays: true, // Include patients even if no doctor is found
          },
        },
        {
          $project: {
            fullName: 1,
            birthDate: 1,
            createdAt: 1,
            patientStatus: 1,
            category: 1,
            nextVisit: 1,
            doctorId: 1, // Keep doctorId if needed
            doctorName: "$doctorInfo.name", // Extract doctor's name from doctorInfo
            "diagnoseHistory.diagnosis": 1,
            "diagnoseHistory.status": 1,
            "diagnoseHistory.uploadedAt": 1,
            diagnoseHistoryLength: { $size: { $ifNull: ["$diagnoseHistory", []] } },
          },
        },
      ]).exec();
    } else {
      // Use populate for the default case
      patients = await Patient.find({})
        .select(safeFields || "-__v")
        .populate({
          path: "doctorId", // Field in Patient schema referencing Doctor
          select: "name", // Only fetch the doctor's name
          model: Doctor, // Reference to the Doctor model
        })
        .lean();

      // Map patients to include doctorName explicitly if needed
      patients = patients.map(patient => ({
        ...patient,
        doctorName: patient.doctorId?.name || "N/A", // Extract name or set default
        doctorId: patient.doctorId?._id || patient.doctorId, // Keep doctorId as string or ObjectId
      }));
    }

    // Total count is just the length of the returned patients
    const total = patients.length;

    return res.status(200).json({ patients, total });
  } catch (error) {
    logger.error("Error fetching patients:", error); // Log the error for debugging
    res.status(500).json({ message: "Error fetching patients", error: error.message });
  }
};

// const getAllPatients = async (req, res) => {
//   try {
//     const { fields, type } = req.query;

//     // Sanitize fields (if provided) to prevent injection
//     const safeFields = fields ? fields.replace(/[^a-zA-Z0-9\s-_]/g, '') : null;

//     let patients;
//     if (type === "summary") {
//       // Use aggregation to extract diagnoseHistory
//       patients = await Patient.aggregate([
//         {
//           $project: {
//             fullName: 1,
//             birthDate: 1,
//             createdAt: 1,
//             patientStatus: 1,
//             category: 1,
//             nextVisit: 1,
//             "diagnoseHistory.diagnosis": 1, 
//             "diagnoseHistory.status": 1,   
//             "diagnoseHistory.uploadedAt": 1,
//             diagnoseHistoryLength: { $size: { $ifNull: ["$diagnoseHistory", []] } },
//           },
//         },
//       ]).exec();
//     } else {

//       patients = await Patient.find({})
//         .select(safeFields || "-__v") 
//         .lean();
//     }

//     // Total count is just the length of the returned patients
//     const total = patients.length;

//     return res.status(200).json({ patients, total });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching patients", error: error.message });
//   }
// };

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