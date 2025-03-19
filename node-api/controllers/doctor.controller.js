const Doctor = require("../models/doctor.model");
const UserService = require("../services/user.service");
const Patient = require("../models/patient");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const logger = require("../config/logger");
const { isValidDate } = require("../utils/dateUtils");
const { fetchDoctors } = require('../utils/doctorService');

const addDoctor = async (req, res) => {
  const {
    name,
    type,
    specialty,
    phone,
    email,
    address,
    workingHours,
    image,
    daysOff,
  } = req.body;

  const existingDoctor = await Doctor.findOne({ email });

  if (existingDoctor) {
    return res
      .status(400)
      .json({ error: "Doctor with this email already exists" });
  }

  const doctor = new Doctor({
    name,
    type,
    specialty,
    phone,
    email,
    address,
    workingHours,
    image,
    daysOff,
  });

  await doctor.save();

  await UserService.createUser(email, "doctor", doctor._id, name);

  res.status(201).json({ message: "Doctor added successfully", doctor });
};

const getDoctors = async (req, res) => {
  const doctors = await Doctor.find();

  res.send(doctors);
};

const getDoctorById = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  res.send(doctor);
};

const updateDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  // if (doctor.email !== req.body.email) {
  //   const existingDoctor = await Doctor.findOne({
  //     email: req.body.email,
  //   });

  //   if (existingDoctor) {
  //     return res
  //       .status(400)
  //       .json({ error: "Doctor with this email already exists" });
  //   }
  // }

  // Prevent email update by removing it from req.body
  if (req.body.email && req.body.email !== doctor.email) {
    return res.status(400).json({ error: "Email cannot be changed" });
  }

  delete req.body.email; // Ensure email is not updated

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    {
      new: true,
      runValidators: true,
    }
  );

  res.send(updatedDoctor);
};

const deleteDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  await Doctor.findByIdAndDelete(req.params.id);

  res.status(204).send(doctor);
};

const getDoctorsByIds = async (req, res) => {
  try {
    const { doctorIds } = req.body;


    // Validate and convert doctorIds to ObjectIDs
    if (!Array.isArray(doctorIds) || doctorIds.length === 0) {
      return res
        .status(400)
        .json({ error: "doctorIds must be a non-empty array" });
    }

    const objectIds = doctorIds.map((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ObjectID: ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    });

    const doctors = await Doctor.find({ _id: { $in: objectIds } })
      .lean()
      .select("name type specialty workingHours daysOff"); 

   
    const transformedDoctors = doctors.map((doctor) => {
     
      const filteredWorkingHours = {};
      for (const day in doctor.workingHours) {
        if (doctor.workingHours[day].enabled) {
          filteredWorkingHours[day] = {
            startTime: doctor.workingHours[day].startTime,
            endTime: doctor.workingHours[day].endTime,
          };
        }
      }

   
      const filteredDaysOff = doctor.daysOff.map((dayOff) => ({
        startDate: dayOff.startDate,
        endDate: dayOff.endDate,
      }));

      return {
        _id: doctor._id,
        name: doctor.name,
        type: doctor.type,
        specialty: doctor.specialty, 
        workingHours: filteredWorkingHours,
        daysOff: filteredDaysOff,
      };
    });

    res.status(200).json({ doctors: transformedDoctors });
  } catch (error) {
    logger.error("Error in getDoctorsByIds:", error);
    res.status(500).json({ error: error.message });
  }
};

const getDoctorsForRevisit = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .lean()
      .select("name type specialty workingHours daysOff");

    const transformedDoctors = doctors.map((doctor) => {
      const filteredWorkingHours = {};
      for (const day in doctor.workingHours) {
        if (doctor.workingHours[day].enabled) {
          filteredWorkingHours[day] = {
            startTime: doctor.workingHours[day].startTime,
            endTime: doctor.workingHours[day].endTime,
          };
        }
      }

      const filteredDaysOff = doctor.daysOff.map((dayOff) => ({
        startDate: dayOff.startDate,
        endDate: dayOff.endDate,
      }));

      return {
        _id: doctor._id.toString(),
        name: doctor.name,
        type: doctor.type,
        specialty: doctor.specialty,
        workingHours: filteredWorkingHours,
        daysOff: filteredDaysOff,
      };
    });

    res.status(200).json({ doctors: transformedDoctors });
  } catch (error) {
    logger.error("Error in getDoctorsForRevisit:", error);
    res.status(500).json({
      error: "Error fetching doctors for revisit",
      details: error.message,
    });
  }
};

const getDoctorPatientsSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        errorCode: "INVALID_DOCTOR_ID",
        message: "Invalid doctor ID format",
      });
    }
    if (type !== "summary") {
      return res.status(400).json({
        errorCode: "INVALID_QUERY_TYPE",
        message: "Invalid query type. Use 'type=summary'.",
      });
    }

    // Aggregate patients where the doctorId appears in diagnoseHistory
    const patients = await Patient.find({
      "diagnoseHistory.doctorId": id,
    }).lean();

    console.log("patients:", patients);

    // If no patients are found, return a 200 with an empty array
    if (!patients || patients.length === 0) {
      return res.status(200).json({
        message: "No patients found for this doctor.",
        data: {
          totalPatients: 0,
          patients: [],
        },
      });
    }

    // Process patient data for summary
    const summary = {
      totalPatients: patients.length,
      patients: patients.map((patient) => {
        const doctorDiagnoses = patient.diagnoseHistory.filter(
          (diag) => diag.doctorId && diag.doctorId.toString() === id
        );

        const totalDiagnoseHistoryLength = patient.diagnoseHistory
          ? patient.diagnoseHistory.length
          : 0;
        const hasNextVisit =
          patient.nextVisit && !isNaN(new Date(patient.nextVisit).getTime());
        const isNew = totalDiagnoseHistoryLength <= 2 && !hasNextVisit;

        return {
          patientId: patient.patientId,
          fullName: patient.fullName,
          category: patient.category,
          totalDiagnoseHistoryLength,
          diagnoseHistory: doctorDiagnoses.map((diag) => ({
            diagnosis: diag.diagnosis,
            uploadedAt: diag.uploadedAt,
            status: diag.status,
            eye: diag.eye,
            confidenceScores: diag.confidenceScores,
            recommend: diag.recommend,
            
          })),
          diagnosisDoctor:id,
          patientStatus: patient.patientStatus,
          createdAt: patient.createdAt,
          nextVisit: patient.nextVisit,
          doctorId: patient.doctorId,
          isNew,
        };
      }),
    };

    res.status(200).json({
      message: "Patients summary retrieved successfully",
      data: {
        totalPatients: summary.totalPatients,
        patients: summary.patients,
      },
    });
  } catch (error) {
    logger.error("Error in getDoctorPatientsSummary:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching doctor patients summary",
      error: error.message,
    });
  }
};

// const getDoctorPatientsSummary = async (req, res) => {
//   try {
//     const userId = req.params.id || req.currentUser.id; // Use params or current user
//     const { type } = req.query;

//     // Validate user ID
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         errorCode: "INVALID_USER_ID",
//         message: "Invalid user ID format",
//       });
//     }

//     // Validate query type
//     if (type !== "summary") {
//       return res.status(400).json({
//         errorCode: "INVALID_QUERY_TYPE",
//         message: "Invalid query type. Use 'type=summary'.",
//       });
//     }

//     // Find the user by ID
//     const user = await User.findById(userId).select("profile role");
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Ensure the user is a doctor
//     if (user.role !== "doctor") {
//       return res.status(403).json({
//         errorCode: "INVALID_ROLE",
//         message: "This user is not a doctor",
//       });
//     }

//     const doctorId = user.profile; // This is the Doctor model ID
//     if (!mongoose.Types.ObjectId.isValid(doctorId)) {
//       return res.status(400).json({
//         errorCode: "INVALID_DOCTOR_ID",
//         message: "Invalid doctor profile ID",
//       });
//     }

//     // Aggregate patients where the doctorId appears in diagnoseHistory
//     const patients = await Patient.find({
//       "diagnoseHistory.doctorId": doctorId,
//     }).lean();

//     console.log("patients:", patients);

//     // If no patients are found, return a 200 with an empty array
//     if (!patients || patients.length === 0) {
//       return res.status(200).json({
//         message: "No patients found for this doctor.",
//         data: {
//           totalPatients: 0,
//           patients: [],
//         },
//       });
//     }

//     // Process patient data for summary
//     const summary = {
//       totalPatients: patients.length,
//       patients: patients.map((patient) => {
//         const doctorDiagnoses = patient.diagnoseHistory.filter(
//           (diag) => diag.doctorId && diag.doctorId.toString() === doctorId.toString()
//         );

//         const totalDiagnoseHistoryLength = patient.diagnoseHistory
//           ? patient.diagnoseHistory.length
//           : 0;
//         const hasNextVisit =
//           patient.nextVisit && !isNaN(new Date(patient.nextVisit).getTime());
//         const isNew = totalDiagnoseHistoryLength <= 2 && !hasNextVisit;

//         return {
//           patientId: patient.patientId,
//           fullName: patient.fullName,
//           category: patient.category,
//           totalDiagnoseHistoryLength,
//           diagnoseHistory: doctorDiagnoses.map((diag) => ({
//             diagnosis: diag.diagnosis,
//             uploadedAt: diag.uploadedAt,
//             status: diag.status,
//             eye: diag.eye,
//             confidenceScores: diag.confidenceScores,
//             recommend: diag.recommend,
//           })),
//           diagnosisDoctor: doctorId, // Use the Doctor ID
//           patientStatus: patient.patientStatus,
//           createdAt: patient.createdAt,
//           nextVisit: patient.nextVisit,
//           doctorId: patient.doctorId,
//           isNew,
//         };
//       }),
//     };

//     res.status(200).json({
//       message: "Patients summary retrieved successfully",
//       data: {
//         totalPatients: summary.totalPatients,
//         patients: summary.patients,
//       },
//     });
//   } catch (error) {
//     console.error("Error in getDoctorPatientsSummary:", error);
//     res.status(500).json({
//       errorCode: "SERVER_ERROR",
//       message: "Error fetching doctor patients summary",
//       error: error.message,
//     });
//   }
// };


const getDoctorByUserId = async (req, res) => {
  try {
    const userId = req.params.id || req.currentUser.id; // Use params or current user
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        errorCode: "INVALID_USER_ID",
        message: "Invalid user ID format",
      });
    }

    // Find the user by ID
    const user = await User.findById(userId).select("profile role");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure the user is a doctor
    if (user.role !== "doctor") {
      return res.status(403).json({
        errorCode: "INVALID_ROLE",
        message: "This user is not a doctor",
      });
    }

    // Fetch the doctor using the profile ID
    const doctor = await Doctor.findById(user.profile);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    res.send(doctor);
  } catch (error) {
    console.error("Error in getDoctorById:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching doctor data",
      error: error.message,
    });
  }
};
// const getDoctorNames = async (req, res) => {
//   try {
//     const doctors = await Doctor.find({}, "name _id"); // Select only name and _id

//     if (!doctors.length) {
//       return res.status(200).json({
//         message: "No doctors found",
//         data: { doctors: [] },
//       });
//     }
//     res.status(200).json({
//       message: "Doctors fetched successfully",
//       doctors: doctors.map((doc) => ({
//         _id: doc._id,
//         name: doc.name,
//       })),
//     });
//   } catch (error) {
//     logger.error("Error in getDoctorNames:", error);
//     res.status(500).json({
//       errorCode: "SERVER_ERROR",
//       message: "Error fetching doctor names",
//       error: error.message,
//     });
//   }
// };
const getDoctorNames = async (req, res) => {
  try {
    const doctors = await Doctor.find({}, "name _id"); 

    // Set caching headers
    res.set({
      "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      ETag: require("crypto")
        .createHash("md5")
        .update(JSON.stringify(doctors))
        .digest("hex"), // Generate ETag
    });

    if (!doctors.length) {
      return res.status(200).json({
        message: "No doctors found",
        data: { doctors: [] },
      });
    }

    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors: doctors.map((doc) => ({
        _id: doc._id,
        name: doc.name,
      })),
    });
  } catch (error) {
    logger.error("Error in getDoctorNames:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching doctor names",
      error: error.message,
    });
  }
};
module.exports = {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorsByIds,
  getDoctorPatientsSummary,
  getDoctorNames,
  getDoctorsForRevisit,
  getDoctorByUserId,
};
