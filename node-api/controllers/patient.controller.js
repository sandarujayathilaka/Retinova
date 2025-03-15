const Patient = require("../models/patient");
const { s3 } = require("../config/aws");
require("dotenv").config();
const mongoose = require("mongoose");
const validator = require("validator");
const logger = require("../utils/logger"); // Hypothetical logger (e.g., Winston)
const { isValidDate, getStartEndOfDay, getStartEndOfMonth } = require("../utils/dateUtils"); // Hypothetical date utilities

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
const getPatientCount = async (req, res) => {
  console.log(req.query)
  try {
    console.log("ree")
    const { patientStatus, nextVisit, doctorId } = req.query;
    console.log(patientStatus, nextVisit, doctorId)
    if (!patientStatus || !nextVisit || !doctorId) {
      return res.status(400).json({
        errorCode: "MISSING_QUERY_PARAMS",
        message: "Missing required query parameters",
      });
    }
    if (!isValidDate(nextVisit)) {
      return res.status(400).json({
        errorCode: "INVALID_DATE",
        message: "Invalid nextVisit date",
      });
    }
    console.log(patientStatus, nextVisit, doctorId)
    const { start, end } = getStartEndOfDay(nextVisit);
    console.log(start, end )
    const count = await Patient.countDocuments({
      patientStatus,
      nextVisit: { $gte: start, $lte: end },
      doctorId,
    });
    console.log(count )
    res.status(200).json({ message: "Patient count retrieved", data: { count } });
  } catch (error) {
    logger.error("Error in getPatientCount:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching patient count",
      error: error.message,
    });
  }
};


// const getPatientCount = async (req, res) => {
//     try {
//       console.log("getPatientCount")
//       console.log(req.params)
//       const { patientStatus, nextVisit, doctorId } = req.query;
//   console.log(patientStatus, nextVisit, doctorId)
//       // Validate required parameters
//       if (!patientStatus || !nextVisit || !doctorId) {
//         return res.status(400).json({
//           success: false,
//           message: "Missing required query parameters: patientStatus, nextVisit, doctorId",
//         });
//       }
  
//       // Convert nextVisit to start and end of day for accurate matching
//       const startOfDay = new Date(nextVisit);
//       startOfDay.setUTCHours(0, 0, 0, 0);
//       const endOfDay = new Date(nextVisit);
//       endOfDay.setUTCHours(23, 59, 59, 999);
  
//       // Query the database for patients with matching status, nextVisit, and doctorId in diagnoseHistory
//       const count = await Patient.countDocuments({
//         patientStatus,
//         nextVisit: {
//           $gte: startOfDay,
//           $lte: endOfDay,
//         },
//         "diagnoseHistory.doctorId": doctorId, // Match doctorId in diagnoseHistory array
//       });
  
//       res.status(200).json({
//         success: true,
//         count,
//       });
//     } catch (error) {
//       console.error("Error fetching patient count:", error);
//       res.status(500).json({
//         success: false,
//         message: "Server error while fetching patient count",
//         error: error.message,
//       });
//     }
//   };

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
    patient.doctorId = doctorId;
    patient.nextVisit = new Date(revisitDate);
    patient.patientStatus = patientStatus;
    const updatedPatient = await patient.save();
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

// Fetch all patients with pagination
const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const patients = await Patient.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    const total = await Patient.countDocuments();
    res.status(200).json({
      message: "Patients retrieved",
      data: {
        patients,
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
const sanitizeRegex = (input) => validator.escape(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    if (gender) query.gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
    const skip = (page - 1) * limit;
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("patientId fullName nic gender contactNumber email address diagnoseHistory birthDate age")
      .lean();
    const total = await Patient.countDocuments(query);
    res.status(200).json({
      message: "Patients retrieved",
      data: {
        patients,
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
      primaryPhysician,
      emergencyContact,
    } = req.body;
    if (!fullName || !birthDate || !gender || !nic || !contactNumber || !email || !address) {
      return res.status(400).json({
        errorCode: "MISSING_FIELDS",
        message: "Required fields are missing",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        errorCode: "INVALID_EMAIL",
        message: "Invalid email",
      });
    }
    if (!isValidDate(birthDate)) {
      return res.status(400).json({
        errorCode: "INVALID_DATE",
        message: "Invalid birth date",
      });
    }
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
    let physicianId;
    if (primaryPhysician) {
      if (!mongoose.Types.ObjectId.isValid(primaryPhysician)) {
        return res.status(400).json({
          errorCode: "INVALID_PHYSICIAN_ID",
          message: "Invalid primaryPhysician ID format",
        });
      }
      physicianId = new mongoose.Types.ObjectId(primaryPhysician);
    }
    const patientId = await mongoose.connection.transaction(async (session) => {
      const lastPatient = await Patient.findOne().sort({ createdAt: -1 }).session(session).select("patientId");
      return lastPatient ? `P${parseInt(lastPatient.patientId.replace(/\D/g, "")) + 1}` : "P1";
    });
    const newPatient = new Patient({
      patientId,
      fullName: validator.escape(fullName),
      birthDate: new Date(birthDate),
      gender,
      nic: sanitizedNic,
      contactNumber,
      email,
      address,
      bloodType,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      allergies,
      primaryPhysician: physicianId,
      emergencyContact,
    });
    await newPatient.save();
    res.status(201).json({ message: "Patient added successfully", data: newPatient });
  } catch (error) {
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
    console.log(req)
    const { patientId } = req.params;
    const patient = await Patient.findOne({ patientId }).lean();
    if (!patient) {
      return res.status(404).json({
        errorCode: "PATIENT_NOT_FOUND",
        message: "Patient not found",
      });
    }
    res.status(200).json({ message: "Patient retrieved", data: patient });
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
const editPatient = async (req, res) => {
  try {
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
      primaryPhysician,
      emergencyContact,
    } = req.body;
    
    if (!fullName || !birthDate || !gender || !nic || !contactNumber || !email || !address) {
      return res.status(400).json({
        errorCode: "MISSING_FIELDS",
        message: "Required fields are missing",
      });
    }
  
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({
        errorCode: "PATIENT_NOT_FOUND",
        message: "Patient not found",
      });
    }
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
    if (birthDate && !isValidDate(birthDate)) {
      return res.status(400).json({
        errorCode: "INVALID_DATE",
        message: "Invalid birth date",
      });
    }
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({
        errorCode: "INVALID_EMAIL",
        message: "Invalid email",
      });
    }
    patient.fullName = fullName ? validator.escape(fullName) : patient.fullName;
    patient.nic = nic ? validator.escape(nic) : patient.nic;
    patient.birthDate = birthDate ? new Date(birthDate) : patient.birthDate;
    patient.gender = gender || patient.gender;
    patient.contactNumber = contactNumber || patient.contactNumber;
    patient.email = email !== undefined ? email : patient.email;
    patient.address = address !== undefined ? address : patient.address;
    patient.bloodType = bloodType !== undefined ? bloodType : patient.bloodType;
    patient.height = height !== undefined ? Number(height) : patient.height;
    patient.weight = weight !== undefined ? Number(weight) : patient.weight;
    patient.allergies = allergies !== undefined ? allergies : patient.allergies;
    patient.primaryPhysician =
      primaryPhysician !== undefined && mongoose.Types.ObjectId.isValid(primaryPhysician)
        ? new mongoose.Types.ObjectId(primaryPhysician)
        : patient.primaryPhysician;
    patient.emergencyContact = emergencyContact !== undefined ? emergencyContact : patient.emergencyContact;
    const updatedPatient = await patient.save();
    res.status(200).json({ message: "Patient updated successfully", data: updatedPatient });
  } catch (error) {
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
    record.condition = req.body.condition ? validator.escape(req.body.condition) : record.condition;
    record.diagnosedAt = req.body.diagnosedAt && isValidDate(req.body.diagnosedAt) ? new Date(req.body.diagnosedAt) : record.diagnosedAt;
    record.notes = req.body.notes ? validator.escape(req.body.notes) : record.notes;
    record.isChronicCondition = req.body.isChronicCondition === "true" ? true : record.isChronicCondition;
    if (req.body.medications) {
      try {
        record.medications = JSON.parse(req.body.medications);
      } catch {
        return res.status(400).json({
          errorCode: "INVALID_JSON",
          message: "Invalid JSON format for medications",
        });
      }
    }
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
      const originalFilePaths = [...record.filePaths];
      record.filePaths = record.filePaths.filter((path) => !filesToRemove.includes(path));
      try {
        await Promise.all(filesToRemove.map(deleteFileFromS3));
      } catch (s3Error) {
        record.filePaths = originalFilePaths; // Rollback on failure
        throw s3Error;
      }
    }
    const newFilePaths = await Promise.all(files.map((f) => uploadFileToS3(f, patientId)));
    record.filePaths.push(...newFilePaths);
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
