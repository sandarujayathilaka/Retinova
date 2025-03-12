const Patient = require("../models/patient");
const fs = require("fs");
const { s3 } = require("../config/aws");
// const axios = require("axios");
require("dotenv").config();
const path = require("path");



const getPatientCount = async (req, res) => {
  try {
    console.log("called");
    console.log(req.query);
    const { patientStatus, nextVisit, doctorId } = req.query;

    if (!patientStatus || !nextVisit || !doctorId) {
      return res.status(400).json({
        success: false,
        message: "Missing required query parameters",
      });
    }

    const startOfDay = new Date(nextVisit);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(nextVisit);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const count = await Patient.countDocuments({
      patientStatus,
      nextVisit: { $gte: startOfDay, $lte: endOfDay },
      doctorId, // Use top-level doctorId instead of diagnoseHistory
    });
    console.log(count);
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error fetching patient count:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updatePatientRevisit = async (req, res) => {
  try {
    const { patientId } = req.params; // Get patientId from URL params
    const { doctorId, revisitDate } = req.body; // Get doctorId and nextVisit from request body
    console.log(patientId, doctorId, revisitDate);
    // Validate required fields
    if (!doctorId || !revisitDate) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID and next visit date are required",
      });
    }

    // Validate patientId exists
    const patient = await Patient.findOne({ patientId });
    console.log(patient);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `Patient with ID ${patientId} not found`,
      });
    }

    // Update patient fields
    patient.doctorId = doctorId;
    patient.nextVisit = new Date(revisitDate); // Convert ISO string to Date object
    patient.patientStatus = "Review"; // Optionally set status to "Review" since this is a revisit

    // Save the updated patient
    const updatedPatient = await patient.save();
    console.log(updatedPatient);
    // Return success response
    res.status(200).json({
      success: true,
      message: "Revisit date assigned successfully",
      data: {
        patientId: updatedPatient.patientId,
        doctorId: updatedPatient.doctorId,
        nextVisit: updatedPatient.revisitDate,
        patientStatus: updatedPatient.patientStatus,
      },
    });
  } catch (error) {
    console.error("Error updating patient revisit:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// const getPatientCount = async (req, res) => {
//   try {
//     console.log("getPatientCount")
//     console.log(req.query)
//     const { patientStatus, nextVisit, doctorId } = req.query;
// console.log(patientStatus, nextVisit, doctorId)
//     // Validate required parameters
//     if (!patientStatus || !nextVisit || !doctorId) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required query parameters: patientStatus, nextVisit, doctorId",
//       });
//     }

//     // Convert nextVisit to start and end of day for accurate matching
//     const startOfDay = new Date(nextVisit);
//     startOfDay.setUTCHours(0, 0, 0, 0);
//     const endOfDay = new Date(nextVisit);
//     endOfDay.setUTCHours(23, 59, 59, 999);

//     // Query the database for patients with matching status, nextVisit, and doctorId in diagnoseHistory
//     const count = await Patient.countDocuments({
//       patientStatus,
//       nextVisit: {
//         $gte: startOfDay,
//         $lte: endOfDay,
//       },
//       "diagnoseHistory.doctorId": doctorId, // Match doctorId in diagnoseHistory array
//     });

//     res.status(200).json({
//       success: true,
//       count,
//     });
//   } catch (error) {
//     console.error("Error fetching patient count:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching patient count",
//       error: error.message,
//     });
//   }
// };

// Optional: Get patient counts for an entire month (optimization)
const getPatientCountsForMonth = async (req, res) => {
  try {
    const { patientStatus, doctorId, month } = req.query;

    if (!patientStatus || !doctorId || !month) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required query parameters: patientStatus, doctorId, month",
      });
    }

    // Parse month (e.g., "2025-03") to get start and end dates
    const [year, monthNum] = month.split("-");
    const startOfMonth = new Date(Date.UTC(year, monthNum - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

    // Aggregate patient counts by day
    const patients = await Patient.aggregate([
      {
        $match: {
          patientStatus,
          nextVisit: { $gte: startOfMonth, $lte: endOfMonth },
          "diagnoseHistory.doctorId": doctorId,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$nextVisit" } },
          count: { $sum: 1 },
        },
      },
    ]);

    // Format results as an object
    const counts = {};
    patients.forEach((p) => (counts[p._id] = p.count));

    res.status(200).json({
      success: true,
      counts,
    });
  } catch (error) {
    console.error("Error fetching patient counts for month:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching patient counts",
      error: error.message,
    });
  }
};
// Fetch all patients
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.status(200).json({ patients });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching patients",
      error: error.message,
    });
  }
};

const getPatientsByStatus = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search, gender } = req.query;
    const query = { patientStatus: status };

    if (search) {
      query.$or = [
        { patientId: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
        { nic: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (gender) {
      query.gender =
        gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
    }

    const skip = (page - 1) * limit;
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select(
        "patientId fullName nic gender contactNumber email address diagnoseHistory birthDate age"
      );

    const total = await Patient.countDocuments(query);
console.log(patients)
    res.status(200).json({
      patients,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalPatients: total,
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      bloodType,        // New optional field
      height,           // New optional field
      weight,           // New optional field
      allergies,        // New optional field
      primaryPhysician, // New optional field
      emergencyContact, // New optional field (object)
    } = req.body;

    // Validate only required fields
    if (!fullName || !birthDate || !gender || !nic || !contactNumber) {
      return res.status(400).json({
        errorCode: "MISSING_FIELDS",
        message: "Required fields (fullName, birthDate, gender, nic, contactNumber) are missing",
      });
    }

    // Check for duplicate NIC
    const existingPatient = await Patient.findOne({ nic });
    if (existingPatient) {
      return res.status(400).json({
        errorCode: "DUPLICATE_NIC",
        message: "Patient with this NIC already exists",
      });
    }

    // Check for duplicate email only if provided
    if (email) {
      const existingPatientEmail = await Patient.findOne({ email });
      if (existingPatientEmail) {
        return res.status(400).json({
          errorCode: "DUPLICATE_EMAIL",
          message: "Patient with this email already exists",
        });
      }
    }

    // Get last patient and generate new patientId manually
    const lastPatient = await Patient.findOne({}, {}, { sort: { patientId: -1 } });
    let newPatientId;
    if (lastPatient && lastPatient.patientId) {
      const lastNumber = parseInt(lastPatient.patientId.replace(/\D/g, ""), 10) || 0;
      newPatientId = `P${lastNumber + 1}`;
    } else {
      newPatientId = "P1"; // If no patient exists, start with P1
    }

    // Prepare the new patient object with all fields
    const newPatient = new Patient({
      patientId: newPatientId,
      fullName,
      birthDate: new Date(birthDate), // Ensure it's a Date object
      gender,
      nic,
      contactNumber,
      email: email || undefined,             // Optional
      address: address || undefined,         // Optional
      bloodType: bloodType || undefined,     // Optional
      height: height ? Number(height) : undefined, // Optional, convert to number
      weight: weight ? Number(weight) : undefined, // Optional, convert to number
      allergies: allergies || undefined,     // Optional
      primaryPhysician: primaryPhysician || undefined, // Optional
      emergencyContact: emergencyContact || undefined, // Optional object
    });

    await newPatient.save();
    res.status(201).json({
      message: "Patient added successfully",
      patient: newPatient,
    });
  } catch (error) {
    console.error("Error adding patient:", error);
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
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    console.log(patient)
    console.log(patient.age)
    if (!patient) {
      return res
        .status(404)
        .json({ errorCode: "PATIENT_NOT_FOUND", message: "Patient not found" });
    }
    res.status(200).json({ patient });
  } catch (error) {
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching patient",
      error: error.message,
    });
  }
};

// Edit a patient's details (without age)
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
      bloodType,        // New optional field
      height,           // New optional field
      weight,           // New optional field
      allergies,        // New optional field
      primaryPhysician, // New optional field
      emergencyContact, // New optional field (object)
    } = req.body;

    console.log("Request Params:", req.params);
    console.log("Request Body:", req.body);

    // Find the patient by patientId first
    const existingPatient = await Patient.findOne({ patientId });
    if (!existingPatient) {
      return res
        .status(404)
        .json({ errorCode: "PATIENT_NOT_FOUND", message: "Patient not found" });
    }

    // Ensure NIC is unique except for the current patient
    const duplicateNIC = await Patient.findOne({
      nic,
      _id: { $ne: existingPatient._id },
    });
    if (duplicateNIC) {
      return res.status(400).json({
        errorCode: "DUPLICATE_NIC",
        message: "Patient with this NIC already exists",
      });
    }

    // Ensure email is unique except for the current patient, only if email is provided
    if (email) {
      const duplicateEmail = await Patient.findOne({
        email,
        _id: { $ne: existingPatient._id },
      });
      if (duplicateEmail) {
        return res.status(400).json({
          errorCode: "DUPLICATE_EMAIL",
          message: "Patient with this email already exists",
        });
      }
    }

    // Update patient fields manually, only updating if new values are provided
    existingPatient.fullName = fullName || existingPatient.fullName;
    existingPatient.nic = nic || existingPatient.nic;
    existingPatient.birthDate = birthDate ? new Date(birthDate) : existingPatient.birthDate;
    existingPatient.gender = gender || existingPatient.gender;
    existingPatient.contactNumber = contactNumber || existingPatient.contactNumber;
    existingPatient.email = email !== undefined ? email : existingPatient.email; // Allow empty string or null
    existingPatient.address = address !== undefined ? address : existingPatient.address; // Allow empty string or null
    existingPatient.bloodType = bloodType !== undefined ? bloodType : existingPatient.bloodType; // Optional
    existingPatient.height = height !== undefined ? Number(height) : existingPatient.height; // Optional, convert to number
    existingPatient.weight = weight !== undefined ? Number(weight) : existingPatient.weight; // Optional, convert to number
    existingPatient.allergies = allergies !== undefined ? allergies : existingPatient.allergies; // Optional
    existingPatient.primaryPhysician =
      primaryPhysician !== undefined ? primaryPhysician : existingPatient.primaryPhysician; // Optional
    existingPatient.emergencyContact =
      emergencyContact !== undefined ? emergencyContact : existingPatient.emergencyContact; // Optional object

    // Save the patient to trigger any pre-save hooks (e.g., age calculation)
    const updatedPatient = await existingPatient.save();

    console.log("Updated Patient:", updatedPatient);
    res.status(200).json({
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Update Error:", error);
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
    const deletedPatient = await Patient.findOneAndDelete({
      patientId: req.params.patientId,
    });
    if (!deletedPatient) {
      return res
        .status(404)
        .json({ errorCode: "PATIENT_NOT_FOUND", message: "Patient not found" });
    }
    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error deleting patient",
      error: error.message,
    });
  }
};

// Get all medical records for a patient
// controllers/medicalHistory.controller.js
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

    if (!Array.isArray(patient.medicalHistory)) {
      patient.medicalHistory = [];
    }

    const file = req.file;
    const fileName = `${Date.now()}_${file.originalname}`;
    const s3Key = `medical-records/${patientId}/${fileName}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: "public-read",
    };

    const s3Response = await s3.upload(params).promise();
    const fileUrl = s3Response.Location;

    const newRecord = {
      condition: req.body.condition || "Uploaded File",
      diagnosedAt: req.body.diagnosedAt ? new Date(req.body.diagnosedAt) : null,
      medications: req.body.medications ? JSON.parse(req.body.medications) : [],
      filePaths: [fileUrl], // Use array instead of filePath
    };

    patient.medicalHistory.push(newRecord);
    await patient.save();

    res.status(201).json({
      message: "Medical record file uploaded successfully",
      medicalHistory: newRecord,
      fileUrl,
    });
  } catch (error) {
    console.error("Error uploading medical history file:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error uploading medical history file",
      error: error.message,
    });
  }
};

const getmedicalHistoryFiles = async (req, res) => {
  try {
    const { recordId } = req.params;
    const patient = await Patient.findOne({ "medicalHistory._id": recordId });
    if (!patient) {
      return res.status(404).json({ message: "Record not found" });
    }
    const record = patient.medicalHistory.id(recordId);
    if (!record.filePaths || record.filePaths.length === 0) {
      return res.status(404).json({ message: "Files not found" });
    }
    // Redirect to the first file URL (or handle multiple files differently)
    res.redirect(record.filePaths[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving file", error: error.message });
  }
};

const getmedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({
        errorCode: "PATIENT_NOT_FOUND",
        message: "Patient not found",
      });
    }
    res.status(200).json({ medicalHistory: patient.medicalHistory });
  } catch (error) {
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching medical history",
      error: error.message,
    });
  }
};
const addmedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    let records = req.body.records;
    const files = req.files || [];

    console.log("Patient ID:", patientId);
    console.log("Records Received:", records);
    console.log("Files Received:", files);

    if (typeof records === "string") {
      try {
        records = JSON.parse(records);
      } catch (error) {
        return res.status(400).json({
          errorCode: "INVALID_DATA",
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

    if (!Array.isArray(patient.medicalHistory)) {
      patient.medicalHistory = [];
    }

    const newRecords = [];

    for (const [index, record] of records.entries()) {
      const { condition, diagnosedAt, medications = [] } = record;

      if (!condition) {
        return res.status(400).json({
          errorCode: "MISSING_FIELDS",
          message: "Condition is required",
        });
      }

      const filePaths = [];
      const fileKeys = files
        .filter((f) => f.fieldname.startsWith(`records[${index}][files]`))
        .map((f) => f);

      console.log(`Files for record ${index}:`, fileKeys); // Debug: Check filtered files

      for (const file of fileKeys) {
        const fileName = `${Date.now()}_${file.originalname}`;
        const s3Key = `medical-records/${patientId}/${fileName}`;

        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
          // ACL: "public-read",
        };

        const s3Response = await s3.upload(params).promise();
        console.log(`S3 Response for file ${file.originalname}:`, s3Response); // Debug: Check S3 upload
        filePaths.push(s3Response.Location);
      }

      console.log(`filePaths for record ${index}:`, filePaths); // Debug: Check filePaths before saving

      let diagnosedAtDate = null;
      if (diagnosedAt) {
        diagnosedAtDate = new Date(diagnosedAt);
        if (isNaN(diagnosedAtDate)) {
          diagnosedAtDate = null;
        }
      }

      const processedMedications = Array.isArray(medications)
        ? medications.map((m) => m.trim()).filter((m) => m !== "")
        : [];

      newRecords.push({
        condition,
        diagnosedAt: diagnosedAtDate,
        medications: processedMedications,
        filePaths,
      });
    }

    console.log("newRecords to save:", newRecords); // Debug: Final records before saving
    patient.medicalHistory.push(...newRecords);
    await patient.save();

    console.log("Patient after save:", patient); // Debug: Verify database update

    res.status(201).json({
      message: "Medical records added successfully",
      medicalHistory: newRecords,
    });
  } catch (error) {
    console.error("Error adding medical records:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error adding medical records",
      error: error.message,
    });
  }
};
const updateMedicalHistory = async (req, res) => {
  try {
    const { patientId, recordId } = req.params;
    const files = req.files || [];

    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res
        .status(404)
        .json({ errorCode: "PATIENT_NOT_FOUND", message: "Patient not found" });
    }

    const record = patient.medicalHistory.id(recordId);
    if (!record) {
      return res
        .status(404)
        .json({ errorCode: "RECORD_NOT_FOUND", message: "Record not found" });
    }

    // Update fields from FormData
    record.condition = req.body.condition || record.condition;
    record.diagnosedAt = req.body.diagnosedAt
      ? new Date(req.body.diagnosedAt)
      : record.diagnosedAt;

    // Safely parse medications
    if (req.body.medications) {
      try {
        record.medications = JSON.parse(req.body.medications);
      } catch (parseError) {
        return res.status(400).json({
          errorCode: "INVALID_JSON",
          message: "Invalid JSON format for medications",
          details: parseError.message,
        });
      }
    }

    // Handle files to remove
    if (req.body.filesToRemove) {
      try {
        const filesToRemove = JSON.parse(req.body.filesToRemove);
        if (Array.isArray(filesToRemove) && filesToRemove.length > 0) {
          console.log("Files to remove (original):", filesToRemove);
          console.log("Current filePaths before filtering:", record.filePaths);

          // Filter using the original (encoded) filesToRemove to match record.filePaths
          const originalFilePaths = [...record.filePaths];
          record.filePaths = record.filePaths.filter(
            (path) => !filesToRemove.includes(path)
          );
          console.log("Filtered filePaths:", record.filePaths);

          // Track successfully deleted files
          const successfullyDeleted = [];

          // Delete files from S3
          for (const fileUrl of filesToRemove) {
            const decodedUrl = decodeURIComponent(fileUrl); // Decode for S3 key
            const s3Key = decodedUrl.split("/").slice(3).join("/");
            console.log(`Attempting to delete S3 key: ${s3Key}`);

            const deleteParams = {
              Bucket: process.env.S3_BUCKET_NAME,
              Key: s3Key,
            };

            try {
              const deleteResponse = await s3
                .deleteObject(deleteParams)
                .promise();
              console.log(
                `Successfully deleted ${s3Key} from S3:`,
                deleteResponse
              );
              successfullyDeleted.push(fileUrl); // Track using original URL
            } catch (s3Error) {
              console.error(`Failed to delete ${s3Key} from S3:`, s3Error);
              if (successfullyDeleted.length === 0) {
                record.filePaths = [...originalFilePaths];
              } else {
                record.filePaths = originalFilePaths.filter(
                  (path) => !successfullyDeleted.includes(path)
                );
              }
              throw s3Error; // Stop execution and report error
            }
          }
        }
      } catch (parseError) {
        return res.status(400).json({
          errorCode: "INVALID_JSON",
          message: "Invalid JSON format for filesToRemove",
          details: parseError.message,
        });
      }
    }

    // Upload new files to S3 and append to filePaths
    for (const file of files) {
      const fileName = `${Date.now()}_${file.originalname}`;
      const s3Key = `medical-records/${patientId}/${fileName}`;
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: "public-read",
      };
      const s3Response = await s3.upload(params).promise();
      record.filePaths.push(s3Response.Location);
      console.log(`Uploaded new file: ${s3Response.Location}`);
    }

    await patient.save();
    res.json({
      message: "Record updated successfully",
      medicalHistory: record,
    });
  } catch (error) {
    console.error("Error updating medical record:", error);
    res.status(500).json({ errorCode: "SERVER_ERROR", message: error.message });
  }
};
const deletemedicalHistory = async (req, res) => {
  try {
    const { patientId, recordId } = req.params;

    // Find the patient
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res
        .status(404)
        .json({ errorCode: "PATIENT_NOT_FOUND", message: "Patient not found" });
    }

    // Find the record to delete
    const record = patient.medicalHistory.id(recordId);
    if (!record) {
      return res
        .status(404)
        .json({ errorCode: "RECORD_NOT_FOUND", message: "Record not found" });
    }

    // Delete associated files from S3
    if (record.filePaths && record.filePaths.length > 0) {
      console.log("filePaths to delete:", record.filePaths);

      const deletePromises = record.filePaths.map(async (filePath) => {
        let s3Key;
        try {
          const urlPrefix = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
          s3Key = filePath.replace(urlPrefix, "");
          s3Key = decodeURIComponent(s3Key); // Decode %20 to space
        } catch (error) {
          console.error("Failed to parse S3 key from:", filePath, error);
          return Promise.resolve();
        }

        if (!s3Key || s3Key === filePath) {
          console.error("No valid S3 key extracted from:", filePath);
          return Promise.resolve();
        }

        console.log("Deleting S3 key:", s3Key);

        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: s3Key,
        };

        try {
          const result = await s3.deleteObject(params).promise();
          console.log("S3 delete result:", result);
          return result;
        } catch (s3Error) {
          console.error("S3 delete failed:", s3Error);
          throw s3Error; // Propagate the error
        }
      });

      await Promise.all(deletePromises);
    }

    // Remove the record from medicalHistory
    patient.medicalHistory.pull(recordId);
    await patient.save();

    res.status(200).json({
      message: "Medical record and associated files deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting medical record:", error);
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
