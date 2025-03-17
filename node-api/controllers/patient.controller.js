const Patient = require("../models/patient");
const Doctor = require("../models/doctor.model");
const { s3 } = require("../config/aws");
require("dotenv").config();
const mongoose = require("mongoose");
const validator = require("validator");
const logger = require("../config/logger"); // Hypothetical logger (e.g., Winston)
const { isValidDate, getStartEndOfDay, getStartEndOfMonth } = require("../utils/dateUtils"); // Hypothetical date utilities
const { format } = require("date-fns");


// Utility function to upload files to S3
const uploadFileToS3 = async (file, patientId) => {
  const fileName = `${Date.now()}_${file.originalname}`;
  const s3Key = `medical-records/${patientId}/${fileName}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  const { Location } = await s3.upload(params).promise();
  return Location;
};

// Utility function to delete files from S3
const deleteFileFromS3 = async (filePath) => {
  const s3Key = decodeURIComponent(filePath.split("/").slice(3).join("/"));
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
  };
  await s3.deleteObject(params).promise();
};

// Get patient count for a specific day
// const getPatientCount = async (req, res) => {
//   console.log(req.query)
//   try {
//     console.log("ree")
//     const { patientStatus, nextVisit, doctorId } = req.query;
//     console.log(patientStatus, nextVisit, doctorId)
//     if (!patientStatus || !nextVisit || !doctorId) {
//       return res.status(400).json({
//         errorCode: "MISSING_QUERY_PARAMS",
//         message: "Missing required query parameters",
//       });
//     }
//     if (!isValidDate(nextVisit)) {
//       return res.status(400).json({
//         errorCode: "INVALID_DATE",
//         message: "Invalid nextVisit date",
//       });
//     }
//     console.log(patientStatus, nextVisit, doctorId)
//     const { start, end } = getStartEndOfDay(nextVisit);
//     console.log(start, end )
//     const count = await Patient.countDocuments({
//       patientStatus,
//       nextVisit: { $gte: start, $lte: end },
//       doctorId,
//     });
//     console.log(count )
//     res.status(200).json({ message: "Patient count retrieved", data: { count } });
//   } catch (error) {
//     logger.error("Error in getPatientCount:", error);
//     res.status(500).json({
//       errorCode: "SERVER_ERROR",
//       message: "Error fetching patient count",
//       error: error.message,
//     });
//   }
// };

const getPatientCount = async (req, res) => {
  try {
    const { patientStatus, nextVisit, doctorId, patientId } = req.query;

    // Validate required parameters
    if (!patientStatus || !nextVisit || !doctorId) {
      return res.status(400).json({
        errorCode: "MISSING_QUERY_PARAMS",
        message: "Missing required query parameters: patientStatus, nextVisit, doctorId",
      });
    }

    if (!isValidDate(nextVisit)) {
      return res.status(400).json({
        errorCode: "INVALID_DATE",
        message: "Invalid nextVisit date",
      });
    }

    // Normalize the date to the start and end of the day
    const { start, end } = getStartEndOfDay(nextVisit);

    // Build the base query
    const query = {
      patientStatus,
      nextVisit: { $gte: start, $lte: end },
      doctorId,
    };

    // Get total count of patients matching the criteria
    const totalCount = await Patient.countDocuments(query);

    // If patientId is provided, check if this specific patient is in the count
    let isPatientIncluded = false;
    if (patientId) {
      const patientQuery = { ...query, patientId };
      const patientExists = await Patient.countDocuments(patientQuery);
      isPatientIncluded = patientExists > 0;
    }

    // Return response with total count and whether the patient is included
    res.status(200).json({
      message: "Patient count retrieved",
      data: {
        totalCount,
        isPatientIncluded: patientId ? isPatientIncluded : undefined, // Only include if patientId was provided
      },
    });
  } catch (error) {
    logger.error("Error in getPatientCount:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching patient count",
      error: error.message,
    });
  }
};

// Update patient revisit details
const updatePatientRevisit = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { doctorId, revisitDate, patientStatus = "Review" } = req.body;

    if (!doctorId || !revisitDate) {
      return res.status(400).json({
        errorCode: "MISSING_FIELDS",
        message: "Doctor ID and revisit date are required",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        errorCode: "INVALID_DOCTOR_ID",
        message: "Invalid doctorId format",
      });
    }
    if (!isValidDate(revisitDate)) {
      return res.status(400).json({
        errorCode: "INVALID_DATE",
        message: "Invalid revisit date",
      });
    }

    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({
        errorCode: "PATIENT_NOT_FOUND",
        message: `Patient with ID ${patientId} not found`,
      });
    }

    // Normalize the revisitDate to the start of the day
    const normalizedRevisitDate = new Date(revisitDate);
    normalizedRevisitDate.setUTCHours(0, 0, 0, 0);

    // Debug logging to inspect values
    console.log("Current patient data:", {
      doctorId: patient.doctorId,
      nextVisit: patient.nextVisit ? patient.nextVisit.toISOString() : "null",
      patientStatus: patient.patientStatus,
    });
    console.log("New data:", {
      doctorId,
      revisitDate: normalizedRevisitDate.toISOString(),
      patientStatus,
    });

    // Check for changes with proper null handling
    const hasChanges =
      patient.doctorId?.toString() !== doctorId || // Handle null/undefined doctorId
      (patient.nextVisit?.toISOString() !== normalizedRevisitDate.toISOString() || // Both dates exist and differ
        (!patient.nextVisit && normalizedRevisitDate) || // From null to a date
        (patient.nextVisit && !normalizedRevisitDate)) || // From date to null
      patient.patientStatus !== patientStatus;

    if (!hasChanges) {
      console.log("No changes detected");
      return res.status(200).json({
        message: "No changes have been made",
        data: {
          patientId: patient.patientId,
          doctorId: patient.doctorId,
          nextVisit: patient.nextVisit,
          patientStatus: patient.patientStatus,
        },
      });
    }

    // Apply updates
    patient.doctorId = doctorId;
    patient.nextVisit = normalizedRevisitDate;
    patient.patientStatus = patientStatus;

    const updatedPatient = await patient.save();

    console.log("Patient updated");
    res.status(200).json({
      message: "Revisit updated successfully",
      data: {
        patientId: updatedPatient.patientId,
        doctorId,
        nextVisit: updatedPatient.nextVisit,
        patientStatus,
      },
    });
  } catch (error) {
    logger.error("Error in updatePatientRevisit:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error updating patient revisit",
      error: error.message,
    });
  }
};


// Get patient counts for a month
const getPatientCountsForMonth = async (req, res) => {
  try {
    const { patientStatus, doctorId, month } = req.query;
    if (!patientStatus || !doctorId || !month) {
      return res.status(400).json({
        errorCode: "MISSING_QUERY_PARAMS",
        message: "Missing required query parameters",
      });
    }
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        errorCode: "INVALID_MONTH_FORMAT",
        message: "Invalid month format (use YYYY-MM)",
      });
    }
    const { start, end } = getStartEndOfMonth(month);
    const patients = await Patient.aggregate([
      { $match: { patientStatus, nextVisit: { $gte: start, $lte: end }, doctorId } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$nextVisit" } }, count: { $sum: 1 } } },
    ]);
    const counts = patients.reduce((acc, p) => ({ ...acc, [p._id]: p.count }), {});
    res.status(200).json({ message: "Monthly patient counts retrieved", data: { counts } });
  } catch (error) {
    logger.error("Error in getPatientCountsForMonth:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching patient counts for month",
      error: error.message,
    });
  }
};

const sanitizeRegex = (input) => validator.escape(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, gender, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { patientId: { $regex: search, $options: "i" } },
      ];
    }
    if (gender && gender !== "all") {
      query.gender = gender;
    }
    if (status && status !== "all") {
      query.patientStatus = status;
    }

    // Fetch patients
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Patient.countDocuments(query);

    // Compute and format fields for each patient
    const patientsWithComputedFields = patients.map((patient) => {
      const latestDiagnosis = patient.diagnoseHistory
        ?.slice()
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];

      let diagnosisDate;
      let diagnosisTime;
      if (patient.patientStatus === "Published" && latestDiagnosis?.recommend?.tests?.length > 0) {
        const latestTest = latestDiagnosis.recommend.tests
          .slice()
          .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))[0];
        diagnosisDate = latestTest?.addedAt || latestDiagnosis?.uploadedAt;
        diagnosisTime = latestTest?.addedAt || latestDiagnosis?.uploadedAt;
      } else {
        diagnosisDate = latestDiagnosis?.uploadedAt;
        diagnosisTime = latestDiagnosis?.uploadedAt;
      }

      const revisitTimeFrame = latestDiagnosis?.revisitTimeFrame || "N/A";

      const patientData = patient.toObject({ virtuals: true });
      patientData.diagnosisDate = diagnosisDate ? format(new Date(diagnosisDate), "dd MMM yyyy") : "N/A";
      patientData.diagnosisTime = diagnosisTime ? format(new Date(diagnosisTime), "HH:mm:ss") : "N/A";
      patientData.revisitTimeFrame = revisitTimeFrame;
      patientData.nextVisit = patient.nextVisit ? format(new Date(patient.nextVisit), "dd MMM yyyy") : "N/A";

      return patientData;
    });

    res.status(200).json({
      message: "Patients retrieved",
      data: {
        patients: patientsWithComputedFields,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalPatients: total,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    logger.error("Error in getAllPatients:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching patients",
      error: error.message,
    });
  }
};

// Fetch patients by status with filtering and pagination



const getPatientsByStatus = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search, gender } = req.query;
    if (!status) {
      return res.status(400).json({
        errorCode: "MISSING_STATUS",
        message: "Status is required",
      });
    }

    const query = { patientStatus: status };
    if (search) {
      const safeSearch = sanitizeRegex(search);
      query.$or = [
        { patientId: { $regex: safeSearch, $options: "i" } },
        { fullName: { $regex: safeSearch, $options: "i" } },
        { nic: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }
    if (gender) {
      query.gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
    }

    const skip = (page - 1) * limit;
    
    // Define fields to select, always include nextVisit for Review
    let selectFields = "patientId fullName nic gender contactNumber email address diagnoseHistory birthDate";
    if (status.toLowerCase() === "review") {
      selectFields += " doctorId nextVisit";
    }

    // Fetch patients
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select(selectFields);

    const total = await Patient.countDocuments(query);

    // Compute and format fields for each patient
    const patientsWithComputedFields = patients.map((patient) => {
      const latestDiagnosis = patient.diagnoseHistory
        ?.slice()
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];

      let diagnosisDate;
      let diagnosisTime;
      if (patient.patientStatus === "Published" && latestDiagnosis?.recommend?.tests?.length > 0) {
        const latestTest = latestDiagnosis.recommend.tests
          .slice()
          .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))[0];
        diagnosisDate = latestTest?.addedAt || latestDiagnosis?.uploadedAt;
        diagnosisTime = latestTest?.addedAt || latestDiagnosis?.uploadedAt;
      } else {
        diagnosisDate = latestDiagnosis?.uploadedAt;
        diagnosisTime = latestDiagnosis?.uploadedAt;
      }

      const revisitTimeFrame = latestDiagnosis?.revisitTimeFrame || "N/A";

      const patientData = patient.toObject({ virtuals: true });
      patientData.diagnosisDate = diagnosisDate ? format(new Date(diagnosisDate), "dd MMM yyyy") : "N/A";
      patientData.diagnosisTime = diagnosisTime ? format(new Date(diagnosisTime), "HH:mm:ss") : "N/A";
      patientData.revisitTimeFrame = revisitTimeFrame;
      patientData.nextVisit = patient.nextVisit ? format(new Date(patient.nextVisit), "dd MMM yyyy") : "N/A";

      return patientData;
    });

    res.status(200).json({
      message: "Patients retrieved",
      data: {
        patients: patientsWithComputedFields,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalPatients: total,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    logger.error("Error in getPatientsByStatus:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching patients by status",
      error: error.message,
    });
  }
};



// Add a new patient
// const addPatient = async (req, res) => {
//   try {
//     const {
//       fullName,
//       birthDate,
//       gender,
//       nic,
//       contactNumber,
//       email,
//       address,
//       bloodType,
//       height,
//       weight,
//       allergies,
//       primaryPhysician,
//       emergencyContact,
//     } = req.body;
//     if (!fullName || !birthDate || !gender || !nic || !contactNumber || !email || !address) {
//       return res.status(400).json({
//         errorCode: "MISSING_FIELDS",
//         message: "Required fields are missing",
//       });
//     }
//     if (!validator.isEmail(email)) {
//       return res.status(400).json({
//         errorCode: "INVALID_EMAIL",
//         message: "Invalid email",
//       });
//     }
//     if (!isValidDate(birthDate)) {
//       return res.status(400).json({
//         errorCode: "INVALID_DATE",
//         message: "Invalid birth date",
//       });
//     }
//     const sanitizedNic = validator.escape(nic);
//     if (await Patient.findOne({ nic: sanitizedNic })) {
//       return res.status(400).json({
//         errorCode: "DUPLICATE_NIC",
//         message: "Patient with this NIC already exists",
//       });
//     }
//     if (await Patient.findOne({ email })) {
//       return res.status(400).json({
//         errorCode: "DUPLICATE_EMAIL",
//         message: "Patient with this email already exists",
//       });
//     }
//     let physicianId;
//     if (primaryPhysician) {
//       if (!mongoose.Types.ObjectId.isValid(primaryPhysician)) {
//         return res.status(400).json({
//           errorCode: "INVALID_PHYSICIAN_ID",
//           message: "Invalid primaryPhysician ID format",
//         });
//       }
//       physicianId = new mongoose.Types.ObjectId(primaryPhysician);
//     }
//     const patientId = await mongoose.connection.transaction(async (session) => {
//       const lastPatient = await Patient.findOne().sort({ createdAt: -1 }).session(session).select("patientId");
//       return lastPatient ? `P${parseInt(lastPatient.patientId.replace(/\D/g, "")) + 1}` : "P1";
//     });
//     const newPatient = new Patient({
//       patientId,
//       fullName: validator.escape(fullName),
//       birthDate: new Date(birthDate),
//       gender,
//       nic: sanitizedNic,
//       contactNumber,
//       email,
//       address,
//       bloodType,
//       height: height ? Number(height) : undefined,
//       weight: weight ? Number(weight) : undefined,
//       allergies,
//       primaryPhysician: physicianId,
//       emergencyContact,
//     });
//     await newPatient.save();
//     res.status(201).json({ message: "Patient added successfully", data: newPatient });
//   } catch (error) {
//     logger.error("Error in addPatient:", error);
//     res.status(500).json({
//       errorCode: "SERVER_ERROR",
//       message: "Error adding patient",
//       error: error.message,
//     });
//   }
// };
const addPatient = async (req, res) => {
  try {
    const {
      fullName,
      birthDate,
      gender,
      nic,
      contactNumber,
      email,
      address,
      bloodType,
      height,
      weight,
      allergies,
      emergencyContact,
    } = req.body;

    // Required field validation
    const requiredFields = { fullName, birthDate, gender, nic, contactNumber, email };
    const missingFields = Object.keys(requiredFields).filter((key) => !requiredFields[key]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        errorCode: "MISSING_FIELDS",
        message: `Required fields are missing: ${missingFields.join(", ")}`,
      });
    }

    // Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        errorCode: "INVALID_EMAIL",
        message: "Invalid email",
      });
    }

    // Birth date validation
    const parsedBirthDate = new Date(birthDate);
    if (isNaN(parsedBirthDate.getTime())) {
      return res.status(400).json({
        errorCode: "INVALID_DATE",
        message: "Invalid birth date",
      });
    }

    // Sanitize and check for duplicates
    const sanitizedNic = validator.escape(nic);
    if (await Patient.findOne({ nic: sanitizedNic })) {
      return res.status(400).json({
        errorCode: "DUPLICATE_NIC",
        message: "Patient with this NIC already exists",
      });
    }

    if (await Patient.findOne({ email })) {
      return res.status(400).json({
        errorCode: "DUPLICATE_EMAIL",
        message: "Patient with this email already exists",
      });
    }


    // Generate patient ID
    const lastPatient = await Patient.findOne().sort({ createdAt: -1 }).select("patientId");
    const patientId = lastPatient ? `P${parseInt(lastPatient.patientId.replace(/\D/g, "")) + 1}` : "P1";

    // Create new patient
    const newPatient = new Patient({
      patientId,
      fullName: validator.escape(fullName),
      birthDate: parsedBirthDate,
      gender,
      nic: sanitizedNic,
      contactNumber,
      email,
      address,
      bloodType,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      allergies,
      emergencyContact,
    });

    await newPatient.save();
    res.status(201).json({ message: "Patient added successfully", data: newPatient });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        path: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        errorCode: "VALIDATION_ERROR",
        message: "Validation failed",
        errors,
      });
    }
    logger.error("Error in addPatient:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error adding patient",
      error: error.message,
    });
  }
};
// Get a single patient by ID
const getPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findOne({ patientId });

    if (!patient) {
      return res.status(404).json({
        errorCode: "PATIENT_NOT_FOUND",
        message: "Patient not found",
      });
    }

    // Compute diagnosisDate, diagnosisTime, and revisitTimeFrame
    const latestDiagnosis = patient.diagnoseHistory
      ?.slice()
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];

    let diagnosisDate;
    let diagnosisTime;
    if (patient.patientStatus === "Published" && latestDiagnosis?.recommend?.tests?.length > 0) {
      const latestTest = latestDiagnosis.recommend.tests
        .slice()
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))[0];
      diagnosisDate = latestTest?.addedAt || latestDiagnosis?.uploadedAt;
      diagnosisTime = latestTest?.addedAt || latestDiagnosis?.uploadedAt;
    } else {
      diagnosisDate = latestDiagnosis?.uploadedAt;
      diagnosisTime = latestDiagnosis?.uploadedAt;
    }

    const revisitTimeFrame = latestDiagnosis?.revisitTimeFrame || "N/A";

    // Convert to plain object and add computed fields
    const patientData = patient.toObject({ virtuals: true });
    
    // Format dates as day-only (e.g., "16 Mar 2025")
    patientData.diagnosisDate = diagnosisDate ? format(new Date(diagnosisDate), "dd MMM yyyy") : "N/A";
    patientData.diagnosisTime = diagnosisTime ? format(new Date(diagnosisTime), "HH:mm:ss") : "N/A"; // Time in HH:mm:ss
    patientData.revisitTimeFrame = revisitTimeFrame;
    patientData.nextVisit = patient.nextVisit ? format(new Date(patient.nextVisit), "dd MMM yyyy") : "N/A";

    res.status(200).json({ message: "Patient retrieved", data: patientData });
  } catch (error) {
    logger.error("Error in getPatient:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching patient",
      error: error.message,
    });
  }
};

// Edit a patient's details
// const editPatient = async (req, res) => {
//   try {
//     const { patientId } = req.params;
//     const {
//       nic,
//       email,
//       birthDate,
//       fullName,
//       gender,
//       contactNumber,
//       address,
//       bloodType,
//       height,
//       weight,
//       allergies,
//       primaryPhysician,
//       emergencyContact,
//     } = req.body;

//     if (!fullName || !birthDate || !gender || !nic || !contactNumber || !email || !address) {
//       return res.status(400).json({
//         errorCode: "MISSING_FIELDS",
//         message: "Required fields are missing",
//       });
//     }
  
//     const patient = await Patient.findOne({ patientId });
//     if (!patient) {
//       return res.status(404).json({
//         errorCode: "PATIENT_NOT_FOUND",
//         message: "Patient not found",
//       });
//     }
//     if (nic && nic !== patient.nic && (await Patient.findOne({ nic, _id: { $ne: patient._id } }))) {
//       return res.status(400).json({
//         errorCode: "DUPLICATE_NIC",
//         message: "Patient with this NIC already exists",
//       });
//     }
//     if (email && email !== patient.email && (await Patient.findOne({ email, _id: { $ne: patient._id } }))) {
//       return res.status(400).json({
//         errorCode: "DUPLICATE_EMAIL",
//         message: "Patient with this email already exists",
//       });
//     }
//     if (birthDate && !isValidDate(birthDate)) {
//       return res.status(400).json({
//         errorCode: "INVALID_DATE",
//         message: "Invalid birth date",
//       });
//     }
//     if (email && !validator.isEmail(email)) {
//       return res.status(400).json({
//         errorCode: "INVALID_EMAIL",
//         message: "Invalid email",
//       });
//     }
//     patient.fullName = fullName ? validator.escape(fullName) : patient.fullName;
//     patient.nic = nic ? validator.escape(nic) : patient.nic;
//     patient.birthDate = birthDate ? new Date(birthDate) : patient.birthDate;
//     patient.gender = gender || patient.gender;
//     patient.contactNumber = contactNumber || patient.contactNumber;
//     patient.email = email !== undefined ? email : patient.email;
//     patient.address = address !== undefined ? address : patient.address;
//     patient.bloodType = bloodType !== undefined ? bloodType : patient.bloodType;
//     patient.height = height !== undefined ? Number(height) : patient.height;
//     patient.weight = weight !== undefined ? Number(weight) : patient.weight;
//     patient.allergies = allergies !== undefined ? allergies : patient.allergies;
//     patient.primaryPhysician =
//       primaryPhysician !== undefined && mongoose.Types.ObjectId.isValid(primaryPhysician)
//         ? new mongoose.Types.ObjectId(primaryPhysician)
//         : patient.primaryPhysician;
//     patient.emergencyContact = emergencyContact !== undefined ? emergencyContact : patient.emergencyContact;
//     const updatedPatient = await patient.save();
//     res.status(200).json({ message: "Patient updated successfully", data: updatedPatient });
//   } catch (error) {
//     logger.error("Error in editPatient:", error);
//     res.status(500).json({
//       errorCode: "SERVER_ERROR",
//       message: "Error updating patient",
//       error: error.message,
//     });
//   }
// };

const editPatient = async (req, res) => {
  try {
    console.log(req.body);
    const { patientId } = req.params;
    const {
      nic,
      email,
      birthDate,
      fullName,
      gender,
      contactNumber,
      address,
      bloodType,
      height,
      weight,
      allergies,
      emergencyContact,
    } = req.body;

    // Required field validation
    const requiredFields = { fullName, birthDate, gender, nic, contactNumber, email, address };
    const missingFields = Object.keys(requiredFields).filter((key) => !requiredFields[key]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        errorCode: "MISSING_FIELDS",
        message: `Required fields are missing: ${missingFields.join(", ")}`,
      });
    }

    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({
        errorCode: "PATIENT_NOT_FOUND",
        message: "Patient not found",
      });
    }

    // Check for duplicates excluding current patient
    if (nic && nic !== patient.nic && (await Patient.findOne({ nic, _id: { $ne: patient._id } }))) {
      return res.status(400).json({
        errorCode: "DUPLICATE_NIC",
        message: "Patient with this NIC already exists",
      });
    }
    if (email && email !== patient.email && (await Patient.findOne({ email, _id: { $ne: patient._id } }))) {
      return res.status(400).json({
        errorCode: "DUPLICATE_EMAIL",
        message: "Patient with this email already exists",
      });
    }

    // Validation: Email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        errorCode: "INVALID_EMAIL",
        message: "Invalid email",
      });
    }

    // Validation: Birth date
    const parsedBirthDate = new Date(birthDate);
    if (isNaN(parsedBirthDate.getTime())) {
      return res.status(400).json({
        errorCode: "INVALID_DATE",
        message: "Invalid birth date",
      });
    }

    // Validation: Emergency contact
    if (emergencyContact !== undefined) {
      const { name, relationship, phone } = emergencyContact || {};
      const hasAnyField = name || relationship || phone;

      if (hasAnyField) {
        if (!(name && relationship && phone)) {
          return res.status(400).json({
            errorCode: "INVALID_EMERGENCY_CONTACT",
            message: "All emergency contact fields are required if any are provided.",
          });
        }
        if (!validator.isMobilePhone(phone, "any") || !/^\d{10}$/.test(phone)) {
          return res.status(400).json({
            errorCode: "INVALID_EMERGENCY_PHONE",
            message: "Emergency contact phone must be a valid 10-digit number.",
          });
        }
      }
      // Removed the reassignment of emergencyContact here
    }

    // Prepare updated data with explicit handling for emergencyContact
    const updatedData = {
      fullName: validator.escape(fullName),
      nic: validator.escape(nic),
      birthDate: parsedBirthDate,
      gender,
      contactNumber,
      email,
      address,
      bloodType: bloodType !== undefined ? bloodType : patient.bloodType,
      height: height !== undefined ? Number(height) : patient.height,
      weight: weight !== undefined ? Number(weight) : patient.weight,
      allergies: allergies !== undefined ? allergies : patient.allergies,
      emergencyContact:
        emergencyContact !== undefined
          ? Object.keys(emergencyContact).length === 0
            ? null // Set to null if empty object is sent
            : emergencyContact
          : patient.emergencyContact,
    };

    // Check if there are any changes
    const hasChanges = Object.keys(updatedData).some((key) => {
      const newValue = updatedData[key];
      const oldValue = patient[key];
      if (key === "emergencyContact") {
        if (newValue === null && !oldValue) return false; // Both null/undefined, no change
        if (newValue === null && oldValue) return true; // Clearing emergencyContact
        if (!newValue && oldValue) return true; // Undefined new vs existing old
        if (newValue && !oldValue) return true; // New value vs no old value
        return JSON.stringify(newValue) !== JSON.stringify(oldValue); // Deep compare
      }
      return JSON.stringify(newValue) !== JSON.stringify(oldValue);
    });

    if (!hasChanges) {
      return res.status(200).json({
        message: "No changes have been made",
        data: patient,
      });
    }

    // Update patient
    Object.assign(patient, updatedData);
    const updatedPatient = await patient.save();
    res.status(200).json({ message: "Patient updated successfully", data: updatedPatient });
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        path: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        errorCode: "VALIDATION_ERROR",
        message: "Validation failed",
        errors,
      });
    }
    logger.error("Error in editPatient:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error updating patient",
      error: error.message,
    });
  }
};
// Delete a patient by ID
const deletePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const deletedPatient = await Patient.findOneAndDelete({ patientId });
    if (!deletedPatient) {
      return res.status(404).json({
        errorCode: "PATIENT_NOT_FOUND",
        message: "Patient not found",
      });
    }
    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    logger.error("Error in deletePatient:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error deleting patient",
      error: error.message,
    });
  }
};

// Upload medical history image
const uploadMedicalHistoryImage = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!req.file) {
      return res.status(400).json({
        errorCode: "NO_FILE_UPLOADED",
        message: "No file provided",
      });
    }
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({
        errorCode: "PATIENT_NOT_FOUND",
        message: "Patient not found",
      });
    }
    if (!Array.isArray(patient.medicalHistory)) patient.medicalHistory = [];
    const fileUrl = await uploadFileToS3(req.file, patientId);
    const newRecord = {
      condition: validator.escape(req.body.condition || "Uploaded File"),
      diagnosedAt: req.body.diagnosedAt && isValidDate(req.body.diagnosedAt) ? new Date(req.body.diagnosedAt) : null,
      medications: req.body.medications ? JSON.parse(req.body.medications) : [],
      filePaths: [fileUrl],
    };
    patient.medicalHistory.push(newRecord);
    await patient.save();
    res.status(201).json({
      message: "Medical record file uploaded successfully",
      data: { medicalHistory: newRecord, fileUrl },
    });
  } catch (error) {
    logger.error("Error in uploadMedicalHistoryImage:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error uploading medical history file",
      error: error.message,
    });
  }
};

// Get medical history files
const getmedicalHistoryFiles = async (req, res) => {
  try {
    const { recordId } = req.params;
    const patient = await Patient.findOne({ "medicalHistory._id": recordId });
    if (!patient) {
      return res.status(404).json({
        errorCode: "RECORD_NOT_FOUND",
        message: "Record not found",
      });
    }
    const record = patient.medicalHistory.id(recordId);
    if (!record.filePaths || record.filePaths.length === 0) {
      return res.status(404).json({
        errorCode: "FILES_NOT_FOUND",
        message: "Files not found",
      });
    }
    res.redirect(record.filePaths[0]); // Redirect to first file
  } catch (error) {
    logger.error("Error in getmedicalHistoryFiles:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error retrieving medical history files",
      error: error.message,
    });
  }
};

// Get all medical history for a patient
const getmedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findOne({ patientId }).lean();
    if (!patient) {
      return res.status(404).json({
        errorCode: "PATIENT_NOT_FOUND",
        message: "Patient not found",
      });
    }
    res.status(200).json({
      message: "Medical history retrieved",
      data: { medicalHistory: patient.medicalHistory || [] },
    });
  } catch (error) {
    logger.error("Error in getmedicalHistory:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching medical history",
      error: error.message,
    });
  }
};

// Add medical history records
const addmedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    let records = req.body.records;
    const files = req.files || [];
    if (typeof records === "string") {
      try {
        records = JSON.parse(records);
      } catch {
        return res.status(400).json({
          errorCode: "INVALID_JSON",
          message: "Invalid JSON format in records",
        });
      }
    }
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        errorCode: "INVALID_DATA",
        message: "Invalid records data",
      });
    }
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({
        errorCode: "PATIENT_NOT_FOUND",
        message: "Patient not found",
      });
    }
    if (!Array.isArray(patient.medicalHistory)) patient.medicalHistory = [];
    const newRecords = await Promise.all(
      records.map(async (record, index) => {
        if (!record.condition) {
          return res.status(400).json({
            errorCode: "MISSING_CONDITION",
            message: "Condition is required",
          });
        }
        const filePaths = await Promise.all(
          files.filter((f) => f.fieldname.startsWith(`records[${index}][files]`)).map((f) => uploadFileToS3(f, patientId))
        );
        return {
          condition: validator.escape(record.condition),
          diagnosedAt: record.diagnosedAt && isValidDate(record.diagnosedAt) ? new Date(record.diagnosedAt) : null,
          medications: Array.isArray(record.medications) ? record.medications : [],
          filePaths,
          notes: validator.escape(record.notes || "No additional notes"),
          isChronicCondition: record.isChronicCondition === "true",
        };
      })
    );
    patient.medicalHistory.push(...newRecords);
    await patient.save();
    res.status(201).json({
      message: "Medical records added successfully",
      data: { medicalHistory: newRecords },
    });
  } catch (error) {
    logger.error("Error in addmedicalHistory:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error adding medical records",
      error: error.message,
    });
  }
};

// Update medical history record
const updateMedicalHistory = async (req, res) => {
  try {
    const { patientId, recordId } = req.params;
    const files = req.files || [];
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({
        errorCode: "PATIENT_NOT_FOUND",
        message: "Patient not found",
      });
    }
    const record = patient.medicalHistory.id(recordId);
    if (!record) {
      return res.status(404).json({
        errorCode: "RECORD_NOT_FOUND",
        message: "Record not found",
      });
    }

    // Store original record data for comparison
    const originalData = {
      condition: record.condition,
      diagnosedAt: record.diagnosedAt ? record.diagnosedAt.toISOString() : null,
      notes: record.notes,
      isChronicCondition: record.isChronicCondition,
      medications: JSON.stringify(record.medications || []),
      filePaths: JSON.stringify(record.filePaths || []),
    };

    // Prepare updated record data
    const updatedRecord = {
      condition: req.body.condition ? validator.escape(req.body.condition) : record.condition,
      diagnosedAt: req.body.diagnosedAt && isValidDate(req.body.diagnosedAt) ? new Date(req.body.diagnosedAt) : record.diagnosedAt,
      notes: req.body.notes ? validator.escape(req.body.notes) : record.notes,
      isChronicCondition: req.body.isChronicCondition === "true" ? true : record.isChronicCondition,
      medications: record.medications || [],
      filePaths: [...record.filePaths],
    };

    // Handle medications
    if (req.body.medications) {
      try {
        updatedRecord.medications = JSON.parse(req.body.medications);
      } catch {
        return res.status(400).json({
          errorCode: "INVALID_JSON",
          message: "Invalid JSON format for medications",
        });
      }
    }

    // Handle file removals
    if (req.body.filesToRemove) {
      let filesToRemove;
      try {
        filesToRemove = JSON.parse(req.body.filesToRemove);
        if (!Array.isArray(filesToRemove)) throw new Error("Invalid filesToRemove format");
      } catch {
        return res.status(400).json({
          errorCode: "INVALID_JSON",
          message: "Invalid JSON format for filesToRemove",
        });
      }
      const originalFilePaths = [...updatedRecord.filePaths];
      updatedRecord.filePaths = updatedRecord.filePaths.filter((path) => !filesToRemove.includes(path));
      try {
        await Promise.all(filesToRemove.map(deleteFileFromS3));
      } catch (s3Error) {
        updatedRecord.filePaths = originalFilePaths; // Rollback on failure
        throw s3Error;
      }
    }

    // Handle new file uploads
    const newFilePaths = await Promise.all(files.map((f) => uploadFileToS3(f, patientId)));
    updatedRecord.filePaths.push(...newFilePaths);

    // Normalize updated data for comparison
    const updatedData = {
      condition: updatedRecord.condition,
      diagnosedAt: updatedRecord.diagnosedAt ? updatedRecord.diagnosedAt.toISOString() : null,
      notes: updatedRecord.notes,
      isChronicCondition: updatedRecord.isChronicCondition,
      medications: JSON.stringify(updatedRecord.medications),
      filePaths: JSON.stringify(updatedRecord.filePaths),
    };

    // Check if there are any changes
    const hasChanges = Object.keys(updatedData).some(
      (key) => updatedData[key] !== originalData[key]
    );

    if (!hasChanges) {
      return res.status(200).json({
        message: "No changes have been made",
        data: { medicalHistory: record },
      });
    }

    // Apply updates to the record
    record.condition = updatedRecord.condition;
    record.diagnosedAt = updatedRecord.diagnosedAt;
    record.notes = updatedRecord.notes;
    record.isChronicCondition = updatedRecord.isChronicCondition;
    record.medications = updatedRecord.medications;
    record.filePaths = updatedRecord.filePaths;

    await patient.save();
    res.status(200).json({
      message: "Record updated successfully",
      data: { medicalHistory: record },
    });
  } catch (error) {
    logger.error("Error in updateMedicalHistory:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error updating medical record",
      error: error.message,
    });
  }
};

// Delete medical history record
const deletemedicalHistory = async (req, res) => {
  try {
    const { patientId, recordId } = req.params;
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({
        errorCode: "PATIENT_NOT_FOUND",
        message: "Patient not found",
      });
    }
    const record = patient.medicalHistory.id(recordId);
    if (!record) {
      return res.status(404).json({
        errorCode: "RECORD_NOT_FOUND",
        message: "Record not found",
      });
    }
    if (record.filePaths && record.filePaths.length > 0) {
      await Promise.all(record.filePaths.map(deleteFileFromS3));
    }
    patient.medicalHistory.pull(recordId);
    await patient.save();
    res.status(200).json({ message: "Medical record deleted successfully" });
  } catch (error) {
    logger.error("Error in deletemedicalHistory:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error deleting medical record",
      error: error.message,
    });
  }
};

module.exports = {
  addPatient,
  getAllPatients,
  getPatient,
  editPatient,
  deletePatient,
  getmedicalHistory,
  addmedicalHistory,
  updatePatientRevisit,
  getPatientCount,
  getPatientCountsForMonth,
  getPatientsByStatus,
  updateMedicalHistory,
  getmedicalHistoryFiles,
  deletemedicalHistory,
  uploadMedicalHistoryImage,
};
