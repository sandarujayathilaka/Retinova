// controllers
const Patient = require("../models/patient");
const Doctor = require("../models/doctor.model");
const logger = require("../config/logger");



const validateQueryParams = (page, limit, fields) => {
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  if (isNaN(parsedPage) || parsedPage < 1) {
    throw new Error("Page must be a positive integer");
  }
  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    throw new Error("Limit must be a positive integer between 1 and 100");
  }
  if (fields && typeof fields !== "string") {
    throw new Error("Fields must be a string");
  }

  // Basic sanitization for fields (prevent injection)
  const safeFields = fields ? fields.replace(/[^a-zA-Z0-9_ -]/g, "") : null;
  return { page: parsedPage, limit: parsedLimit, fields: safeFields };
};

// const getAllPatients = async (req, res) => {
//   try {
//     const { fields, type, page = 1, limit = 10 } = req.query;
//     let { page: parsedPage, limit: parsedLimit, fields: safeFields } = validateQueryParams(page, limit, fields);
//     const skip = (parsedPage - 1) * parsedLimit;

//     let patients, total;
//     if (type === "summary") {
//       // Use aggregation to extract diagnosis and status from diagnoseHistory
//       patients = await Patient.aggregate([
//         {
//           $project: {
//             fullName: 1,
//             birthDate: 1,
//             createdAt: 1,
//             patientStatus: 1,
//             category: 1,
//             nextVisit:1,
//             "diagnoseHistory.diagnosis": 1, // Include diagnosis field
//             "diagnoseHistory.status": 1,    // Include status field
//             "diagnoseHistory.uploadedAt": 1, 
//             diagnoseHistoryLength: { $size:{ $ifNull: ["$diagnoseHistory", []] } },
//           },
//         },
//         { $skip: skip },
//         { $limit: parsedLimit },
//       ]).exec();
//       total = await Patient.countDocuments();
//     } else {
//       // Full retrieval with pagination
//       patients = await Patient.find({})
//         .select(safeFields || "-__v")// Use fields query param or all fields
//         .skip(skip)
//         .limit(parsedLimit)
//         .lean();
//        total = await Patient.countDocuments({});
     
//     }

//     return res.status(200).json({ patients, total, page: parsedPage, limit: parsedLimit });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching patients", error: error.message });
//   }
// };

// const getAllDoctors = async (req, res) => {
//   try {
//     const { fields, type, page = 1, limit = 10 } = req.query;
//     let { page: parsedPage, limit: parsedLimit, fields: safeFields } = validateQueryParams(page, limit, fields);
//     const skip = (parsedPage - 1) * parsedLimit;

//     let doctors, total;
//     if (type === "summary") {
//       doctors = await Doctor.find({})
//         .select("name status type specialty createdAt workingHours daysOff")
//         .skip(skip)
//         .limit(parsedLimit)
//         .lean();
//       total = await Doctor.countDocuments();
//     } else {
//       doctors = await Doctor.find({})
//         .select(safeFields || "-__v")
//         .skip(skip)
//         .limit(parsedLimit)
//         .lean();
//        total = await Doctor.countDocuments({});
      
//     }

//     return res.status(200).json({ doctors, total, page, limit });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching doctors", error: error.message });
//   }
// };

const getAllPatients = async (req, res) => {
  try {
    const { fields, type } = req.query;

    // Sanitize fields (if provided) to prevent injection
    const safeFields = fields ? fields.replace(/[^a-zA-Z0-9\s-_]/g, '') : null;

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
            nextVisit: 1,
            "diagnoseHistory.diagnosis": 1, // Include diagnosis field
            "diagnoseHistory.status": 1,    // Include status field
            "diagnoseHistory.uploadedAt": 1,
            diagnoseHistoryLength: { $size: { $ifNull: ["$diagnoseHistory", []] } },
          },
        },
      ]).exec();
    } else {
      // Full retrieval of all fields (or selected fields)
      patients = await Patient.find({})
        .select(safeFields || "-__v") // Use fields query param or all fields except __v
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
// const getAllPatients = async (req, res) => {
//   try {
//     const { fields, type, page = 1, limit = 10 } = req.query;
//     const skip = (page - 1) * limit;

//     let patients;
//     if (type === "summary") {
//       // Use aggregation to extract diagnosis and status from diagnoseHistory
//       patients = await Patient.aggregate([
//         {
//           $project: {
//             fullName: 1,
//             birthDate: 1,
//             createdAt: 1,
//             patientStatus: 1,
//             category: 1,
//             "diagnoseHistory.diagnosis": 1, // Include diagnosis field
//             "diagnoseHistory.status": 1,    // Include status field
//             "diagnoseHistory.uploadedAt": 1, 
//             diagnoseHistoryLength: { $size: "$diagnoseHistory" }, // Calculate length
//           },
//         },
//       ]).exec();
//     } else {
//       // Full retrieval with pagination
//       patients = await Patient.find({})
//         .select(fields || "") // Use fields query param or all fields
//         .skip(skip)
//         .limit(parseInt(limit))
//         .lean();
//       const total = await Patient.countDocuments({});
//       return res.status(200).json({ patients, total, page: parseInt(page), limit: parseInt(limit) });
//     }

//     res.status(200).json({ patients });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching patients", error: error.message });
//   }
// };

// const getAllDoctors = async (req, res) => {
//   try {
//     const { fields, type, page = 1, limit = 10 } = req.query;
//     const skip = (page - 1) * limit;

//     let doctors;
//     if (type === "summary") {
//       doctors = await Doctor.find({})
//         .select("name status type specialty createdAt workingHours daysOff")
//         .lean();
//     } else {
//       doctors = await Doctor.find({})
//         .select(fields || "")
//         .skip(skip)
//         .limit(parseInt(limit))
//         .lean();
//       const total = await Doctor.countDocuments({});
//       return res.status(200).json({ doctors, total, page, limit });
//     }

//     res.status(200).json({ doctors });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching doctors", error: error.message });
//   }
// };

module.exports = { getAllPatients, getAllDoctors };