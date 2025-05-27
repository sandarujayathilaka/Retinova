const Patient = require("../models/patient");
const { s3 } = require("../config/aws");
const axios = require("axios");
require("dotenv").config();
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const FormData = require("form-data"); // Import FormData


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

