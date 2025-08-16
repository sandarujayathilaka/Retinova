const Patient = require("../models/patient");
const { s3 } = require("../config/aws");
const axios = require("axios");
require("dotenv").config();
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const FormData = require("form-data"); // Import FormData
const User = require("../models/user.model");

// fetch and return the diagnosis history of a patient using their patientId
exports.getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findOne({ patientId });

    if (!patient) return res.status(404).json({ error: "Patient not found" });

    res.json(patient.diagnoseHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @route       GET /api/patients/getAllPatients
 * @desc        Retrieves a paginated list of patients with optional filtering, searching, and sorting.
 */

exports.getAllPatients = async (req, res) => {
  try {
    // Extract query parameters for pagination and optional filtering
    const {
      page = 1,
      limit = 10,
      category,
      gender,
      ageMin,
      ageMax,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Parse pagination parameters with validation
    const pageNum = Math.max(1, parseInt(page)); // Ensure page >= 1
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100); // Cap limit between 1 and 100
    const skip = (pageNum - 1) * limitNum;

    // Build query object
    const query = {};

    // Add filters if provided
    if (category) {
      query.category = { $in: Array.isArray(category) ? category : [category] };
    }
    if (gender) {
      query.gender = gender;
    }
    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) query.age.$gte = parseInt(ageMin);
      if (ageMax) query.age.$lte = parseInt(ageMax);
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { patientId: { $regex: search, $options: "i" } },
      ];
    }

    // Determine sort order (asc = 1, desc = -1)
    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;
    const sortField = sortBy === "age" ? "age" : "createdAt"; // Use indexed fields

    const patients = await Patient.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum)
      .select("-__v"); // Exclude version key

    // Convert to plain objects with virtuals (e.g., age)
    const patientsWithVirtuals = patients.map((patient) =>
      patient.toObject({ virtuals: true })
    );

    // Get total count for pagination metadata
    const totalPatients = await Patient.countDocuments(query);

    if (!patients || patients.length === 0) {
      return res.status(404).json({ error: "No patients found" });
    }

    // Response structure similar to your existing functions
    res.json({
      message: "Patients retrieved successfully",
      data: patientsWithVirtuals,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalPatients / limitNum),
        totalPatients: totalPatients,
        patientsPerPage: limitNum,
      },
      filtersApplied: {
        category: category || null,
        gender: gender || null,
        ageRange: ageMin || ageMax ? { min: ageMin, max: ageMax } : null,
        search: search || null,
      },
    });
  } catch (error) {
    console.error("Error in getAllPatients:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params; // Extract patientId from URL parameters
    console.log("Patient ID:", patientId);

    // Validate patientId
    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    // Fetch patient from database
    const patient = await Patient.findOne({ patientId }).select("-__v"); // Exclude version key

    // Convert to plain objects with virtuals (e.g., age)

    patient.toObject({ virtuals: true });

    // Check if patient exists
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Return patient data
    res.json({
      message: "Patient retrieved successfully",
      data: patient,
    });
  } catch (error) {
    console.error("Error in getPatientById:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @route   GET /api/patients/unchecked
 * @desc    Retrieves all patients who have at least one diagnosis entry marked as "Unchecked".
 */

exports.getPatientsWithUncheckedDiagnoses = async (req, res) => {
  try {
    // Query patients where diagnoseHistory contains at least one "Unchecked" status
    const patients = await Patient.find({
      "diagnoseHistory.status": "Unchecked",
    })
      .lean() // Faster performance, returns plain JS objects
      .select("-__v") // Exclude version field
      .sort({ updatedAt: -1 }); // Sort by most recently updated

    if (!patients || patients.length === 0) {
      return res
        .status(404)
        .json({ message: "No patients with unchecked diagnoses found" });
    }

    res.json({
      message: "Patients with unchecked diagnoses retrieved successfully",
      data: patients,
    });
  } catch (error) {
    console.error("Error in getPatientsWithUncheckedDiagnoses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const VALID_STATUSES = ["Pre-Monitoring", "Monitoring", "Completed", "Review"];

/**
 * @route   GET /api/patients/status
 * @desc    Retrieves a paginated list of patients filtered by a specific patient status,
 *          with optional filters for category, gender, age range, and search term.
 */

exports.getPatientsByOneStatus = async (req, res) => {
  try {
    // Extract query parameters for pagination, filtering, and status
    const {
      page = 1,
      limit = 10,
      category,
      gender,
      ageMin,
      ageMax,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      status, // Status to filter patients by
    } = req.query;

    console.log(status);

    // Validate status parameter
    const statusTrimmed = status?.trim();
    if (!statusTrimmed || !VALID_STATUSES.includes(statusTrimmed)) {
      return res.status(400).json({
        error:
          "Invalid or missing status. Valid values are: Pre-Monitoring, Monitoring, Completed, Review",
      });
    }

    // Parse pagination parameters with validation
    const pageNum = Math.max(1, parseInt(page)); // Ensure page >= 1
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100); // Cap limit between 1 and 100
    const skip = (pageNum - 1) * limitNum;

    // Build query object
    const query = {
      patientStatus: statusTrimmed, // Dynamically filter by the provided status
    };

    // Add filters if provided
    if (category) {
      query.category = { $in: Array.isArray(category) ? category : [category] };
    }
    if (gender) {
      query.gender = gender;
    }
    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin && !isNaN(ageMin)) query.age.$gte = parseInt(ageMin);
      if (ageMax && !isNaN(ageMax)) query.age.$lte = parseInt(ageMax);
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { patientId: { $regex: search, $options: "i" } },
      ];
    }

    // Ensure sort field is valid
    const allowedSortFields = ["createdAt", "age"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    // Determine sort order (asc = 1, desc = -1)
    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;

    // Fetch patients with pagination, sorting, and lean for performance
    const patients = await Patient.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum)
      .lean()
      .select("-__v"); // Exclude version key

    // Get total count for pagination metadata
    const totalPatients = await Patient.countDocuments(query);

    if (!patients || patients.length === 0) {
      return res
        .status(404)
        .json({ error: `No ${statusTrimmed} patients found` });
    }

    // Response structure
    res.json({
      message: `${statusTrimmed} patients retrieved successfully`,
      data: patients,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalPatients / limitNum),
        totalPatients: totalPatients,
        patientsPerPage: limitNum,
      },
      filtersApplied: {
        status: statusTrimmed,
        category: category || null,
        gender: gender || null,
        ageRange: ageMin || ageMax ? { min: ageMin, max: ageMax } : null,
        search: search || null,
      },
    });
  } catch (error) {
    console.error("Error in getPatientsByStatus:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update recommendations for a specific diagnosis in the patient's diagnoseHistory

exports.updateDiagnosisRecommendations = async (req, res) => {
  try {
    const { patientId, diagnosisId } = req.params;
    const { medicine, tests, note } = req.body;

    // Validate required fields (allow empty payload for "Mark as Checked")
    if (medicine === undefined || tests === undefined || note === undefined) {
      return res.status(400).json({
        error: "Medicine, tests, and note are required (can be empty)",
      });
    }

    // Find the patient by ID
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Find the diagnosis in the diagnoseHistory array
    const diagnosis = patient.diagnoseHistory.id(diagnosisId);
    if (!diagnosis) {
      return res.status(404).json({ error: "Diagnosis not found" });
    }

    // Ensure the diagnosis is not already checked
    if (diagnosis.status === "Checked" || diagnosis.status === "Completed") {
      return res.status(400).json({
        error:
          "Cannot update recommendations for a checked or completed diagnosis",
      });
    }

    // Convert medicine to string if it’s an array
    const normalizedMedicine = Array.isArray(medicine)
      ? medicine.join(" ")
      : medicine;

    // Update the recommend field (allow empty values for "Mark as Checked")
    diagnosis.recommend = {
      medicine: normalizedMedicine || "",
      tests: Array.isArray(tests)
        ? tests.map((test) => ({
            testName: test.testName || "",
            status: test.status || "Pending",
            attachmentURL: test.attachmentURL || "",
          }))
        : [],
      note: note || "",
    };

    // Mark the diagnosis as checked after adding recommendations
    diagnosis.status = "Checked";

    // Check if there are any remaining "Unchecked" diagnoses
    const hasUncheckedDiagnoses = patient.diagnoseHistory.some(
      (diag) => diag.status === "Unchecked"
    );

    // If no "Unchecked" diagnoses remain, update patientStatus to "Monitoring"
    if (!hasUncheckedDiagnoses) {
      patient.patientStatus = "Monitoring";
    }

    // Save the updated patient
    await patient.save();

    res.json({
      message: "Diagnosis recommendations updated successfully",
      data: diagnosis,
      patientStatus: patient.patientStatus,
    });
  } catch (error) {
    console.error("Error updating diagnosis recommendations:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

exports.updateDiagnosisReviewRecommendations = async (req, res) => {
  try {
    const { patientId, diagnosisId } = req.params;
    const { reviewInfo, additionalTests, doctorStatus } = req.body;

    // Validate required fields (optional depending on your needs)
    if (!reviewInfo || (!reviewInfo.recommendedMedicine && !reviewInfo.notes)) {
      return res.status(400).json({
        error:
          "At least one of recommendedMedicine or notes is required in reviewInfo",
      });
    }

    // Find the patient by ID
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Find the diagnosis in the diagnoseHistory array
    const diagnosisIndex = patient.diagnoseHistory.findIndex(
      (diag) => diag._id.toString() === diagnosisId
    );

    if (diagnosisIndex === -1) {
      return res.status(404).json({ error: "Diagnosis not found" });
    }

    const diagnosis = patient.diagnoseHistory[diagnosisIndex];

    // Only allow review when patientStatus is "Review"
    if (patient.patientStatus !== "Review") {
      return res.status(403).json({
        error: "Review can only be added when patient status is 'Review'",
      });
    }

    // Prepare new review object for reviewInfo
    const newReview = {
      recommendedMedicine: reviewInfo.recommendedMedicine || "",
      notes: reviewInfo.notes || "",
      updatedAt: new Date(),
    };

    // Append new review to reviewInfo array
    diagnosis.reviewInfo.push(newReview);

    // Add new tests to recommend.tests if provided
    if (additionalTests && Array.isArray(additionalTests)) {
      const newTests = additionalTests.map((test) => ({
        testName: test.testName,
        status: "Pending",
        attachmentURL: test.attachmentURL || "",
        addedAt: new Date(),
      }));
      diagnosis.recommend.tests.push(...newTests);
    }

    // Update revisitTimeFrame if provided (overwrites existing value)
    if (reviewInfo.revisitTimeFrame) {
      diagnosis.revisitTimeFrame = reviewInfo.revisitTimeFrame;
    }

    // Update diagnosis status
    diagnosis.status = "Checked";

    // Check for pending tests in recommend.tests
    const hasPendingTests = diagnosis.recommend.tests.some(
      (test) => test.status === "Pending"
    );

    // Update patient status
    if (hasPendingTests) {
      patient.patientStatus = "Monitoring";
    } else if (
      doctorStatus &&
      [
        "Pre-Monitoring",
        "Published",
        "Review",
        "Completed",
        "Monitoring",
      ].includes(doctorStatus)
    ) {
      patient.patientStatus = doctorStatus; // Use doctor-provided status if no pending tests
    } else {
      patient.patientStatus = "Completed"; // Default to Completed if no pending tests and no doctor status
    }

    // Save the updated patient
    await patient.save();

    res.json({
      message: "Review information and tests added successfully",
      data: patient.diagnoseHistory[diagnosisIndex],
      patientStatus: patient.patientStatus,
    });
  } catch (error) {
    console.error("Error updating diagnosis review:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

exports.updateTestStatus = async (req, res) => {
  try {
    const { patientId, diagnosisId, testId } = req.params;
    const { status } = req.body;

    // Validate the status
    const validStatuses = ["Pending", "In Progress", "Completed", "Reviewed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error:
          "Invalid status. Must be one of: Pending, In Progress, Completed, Reviewed",
      });
    }

    // Find the patient by ID
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Find the diagnosis in the diagnoseHistory array
    const diagnosisIndex = patient.diagnoseHistory.findIndex(
      (diag) => diag._id.toString() === diagnosisId
    );
    if (diagnosisIndex === -1) {
      return res.status(404).json({ error: "Diagnosis not found" });
    }

    const diagnosis = patient.diagnoseHistory[diagnosisIndex];

    // Find the test in the recommend.tests array
    const testIndex = diagnosis.recommend.tests.findIndex(
      (test) => test._id.toString() === testId
    );
    if (testIndex === -1) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Update the test status
    diagnosis.recommend.tests[testIndex].status = status;

    // Save the updated patient
    await patient.save();

    res.json({
      message: "Test status updated successfully",
      data: {
        test: diagnosis.recommend.tests[testIndex],
        diagnosis: patient.diagnoseHistory[diagnosisIndex],
      },
    });
  } catch (error) {
    console.error("Error updating test status:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

exports.addTestToDiagnose = async (req, res) => {
  try {
    const { patientId, diagnoseId } = req.params; // Extract from URL params
    const { testName } = req.body; // Extract test details from body

    // Validate required fields
    if (!testName) {
      return res.status(400).json({
        error: "Test name is required",
      });
    }

    // Find the patient by patientId (assuming patientId is a unique field, not _id)
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Find the diagnosis in the diagnoseHistory array
    const diagnosisIndex = patient.diagnoseHistory.findIndex(
      (diag) => diag._id.toString() === diagnoseId
    );
    if (diagnosisIndex === -1) {
      return res.status(404).json({ error: "Diagnosis not found" });
    }

    const diagnosis = patient.diagnoseHistory[diagnosisIndex];

    // Construct the new test object
    const newTest = {
      testName,
      status: "Pending", // Default to "Pending" if not provided
      addedAt: new Date(), // Automatically set current date/time
    };

    // Push the new test into the tests array
    diagnosis.recommend.tests.push(newTest);

    // Save the updated patient
    await patient.save();

    // Return success response with updated diagnosis
    res.json({
      message: "Test added successfully",
      data: patient.diagnoseHistory[diagnosisIndex],
      patientStatus: patient.patientStatus,
    });
  } catch (error) {
    console.error("Error adding test to diagnose:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

//mobile used
//Get Patient's Diagnosis History

exports.getMyDiagnoseHistory = async (req, res) => {
  try {
    const { id } = req.currentUser;
    console.log("Current user ID:", id);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const patientId = user.profile;
    const patient = await Patient.findOne({ _id: patientId });
    console.log("Patient found:", patient ? patient._id : "Not found");
    console.log(
      "DiagnoseHistory:",
      patient ? patient.diagnoseHistory : "No patient"
    );

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(patient.diagnoseHistory);
  } catch (error) {
    console.error("Error in getDiagnoseHistory:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a Specific Diagnosis by ID
// Get a Specific Diagnosis by ID
exports.getDiagnosisById = async (req, res) => {
  try {
    const { id } = req.currentUser; // User ID from token
    const { diagnosisId } = req.params; // Diagnosis ID from URL

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const patientId = user.profile;
    const patient = await Patient.findOne({ _id: patientId });
    console.log("Patient found:", patient ? patient._id : "Not found");

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const diagnosis = patient.diagnoseHistory.find(
      (diag) => diag._id.toString() === diagnosisId
    );

    if (!diagnosis) {
      console.log(
        `Diagnosis with ID ${diagnosisId} not found in patient ${patient._id}'s history`
      );
      return res.status(404).json({ error: "Diagnosis not found" });
    }

    res.json(diagnosis);
  } catch (error) {
    console.error("Error in getDiagnosisById:", JSON.stringify(error));
    res.status(500).json({ error: "Internal Server Error" });
  }
};
