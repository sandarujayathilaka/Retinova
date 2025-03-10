const Patient = require("../models/patient");
const { s3 } = require("../config/aws");
const axios = require("axios");
require("dotenv").config();
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const FormData = require("form-data"); // Import FormData

exports.uploadImage = async (req, res) => {
  try {
    console.log("dsdsd");
    const { patientId } = req.body;
    if (!patientId || !req.file) {
      return res
        .status(400)
        .json({ error: "Patient ID and Image are required" });
    }

    // **1. Upload Image to AWS S3**
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `dr_images/${Date.now()}_${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    const uploadResult = await s3.upload(params).promise();
    const imageUrl = uploadResult.Location;

    // **2. Find or Create Patient and Add Image Entry**
    let patient = await Patient.findOne({ patientId });
    if (!patient) {
      patient = new Patient({ patientId, diagnoseHistory: [] });
    }
    patient.diagnoseHistory.push({ imageUrl, diagnosis: "Processing" });
    await patient.save();

    // **3. Create FormData and Send Image to Flask API**
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const flaskResponse = await axios.post(
      process.env.FLASK_API_URL_DR,
      formData,
      { headers: { ...formData.getHeaders() } } // Ensure headers are set correctly
    );

    console.log(flaskResponse);

    const diagnosisResult = flaskResponse.data.label;

    // **4. Update MongoDB with Prediction**
    patient.diagnoseHistory[patient.diagnoseHistory.length - 1].diagnosis =
      diagnosisResult;
    await patient.save();

    res.json({
      message: "Upload Successful",
      imageUrl,
      diagnosis: diagnosisResult,
    });
  } catch (error) {
    console.error("Error in uploadImage:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// **Get Patient's Diagnosis History**
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

exports.predictAndFetch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // **1. Extract Patient ID from Image Filename**
    const filename = req.file.originalname; // Example: "abc123y_right_tye785.jpg"
    const patientIdMatch = filename.match(/^([^_]+)_/); // Regex to capture everything before the first '_'

    if (!patientIdMatch) {
      return res.status(400).json({
        error: "Invalid filename format. Expected: patientId_randomtext.jpg",
      });
    }

    const patientId = patientIdMatch[1]; // Extracted patient ID
    console.log(`Extracted Patient ID: ${patientId}`);

    // **2. Check if the Patient Exists in MongoDB**
    const patient = await Patient.findOne({ patientId });

    if (!patient) {
      return res.status(404).json({
        error: `No patient profile found for uploaded image with ID: ${patientId}`,
      });
    }

    console.log(`Patient found: ${patientId}, proceeding with prediction.`);

    const { diseaseType } = req.body;

    if (
      !diseaseType ||
      !["amd", "dr", "rvo", "glaucoma"].includes(diseaseType.toLowerCase())
    ) {
      return res.status(400).json({
        error:
          "Invalid or missing diseaseType parameter. Use 'amd' or 'dr' or 'rvo' or 'glaucoma'.",
      });
    }

    const flaskApiUrl = {
      amd: process.env.FLASK_API_URL_AMD,
      dr: process.env.FLASK_API_URL_DR,
      rvo: process.env.FLASK_API_URL_RVO,
      glaucoma: process.env.FLASK_API_URL_GLAUCOMA,
    }[diseaseType.toLowerCase()];

    console.log(`Using Flask API: ${flaskApiUrl}`);

    // **3. Prepare Image for Flask API**
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // **4. Call Flask API for Prediction**
    const flaskResponse = await axios.post(flaskApiUrl, formData, {
      headers: { ...formData.getHeaders() },
    });

    let diagnosisResult;
    if (diseaseType == "glaucoma") {
      diagnosisResult = flaskResponse.data.predicted_class;
    } else {
      diagnosisResult = flaskResponse.data.label;
    }
    // Extract diagnosis label
    const confidence = flaskResponse.data.confidence; // Confidence scores
    console.log(flaskResponse);
    console.log(confidence);
    // **5. Return Data to Frontend**
    res.json({
      message: "Prediction Successful",
      diagnosis: diagnosisResult,
      confidenceScores: confidence,
      patientData: patient, // Send patient data for reference
    });
  } catch (error) {
    console.error("Error in prediction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    // Extract unique patient IDs from filenames
    let patientIds = [
      ...new Set(req.files.map((file) => path.parse(file.originalname).name)),
    ];

    // Find all patients from the database
    let existingPatients = await Patient.find({
      patientId: { $in: patientIds },
    });

    // Identify missing patient IDs
    let existingPatientIds = new Set(existingPatients.map((p) => p.patientId));
    let missingPatientIds = patientIds.filter(
      (id) => !existingPatientIds.has(id)
    );

    // If any patient ID is missing, return the unavailable list
    if (missingPatientIds.length > 0) {
      return res
        .status(400)
        .json({ error: "Unavailable Patient IDs", missingPatientIds });
    }

    // **1. Upload All Images to AWS S3 First**
    let uploadedImages = await Promise.all(
      req.files.map(async (file) => {
        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `dr_images/${Date.now()}_${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const uploadResult = await s3.upload(params).promise();
        return {
          patientId: path.parse(file.originalname).name,
          imageUrl: uploadResult.Location,
          fileBuffer: file.buffer,
          filename: file.originalname,
          contentType: file.mimetype,
        };
      })
    );

    // **2. Prepare FormData and Send All Images in One API Call**
    const formData = new FormData();
    uploadedImages.forEach((img) => {
      formData.append("files", img.fileBuffer, {
        filename: img.filename,
        contentType: img.contentType,
      });
    });

    const flaskResponse = await axios.post(
      process.env.FLASK_API_URL_2,
      formData,
      { headers: { ...formData.getHeaders() } }
    );

    console.log("Flask Response:", flaskResponse.data);

    // **3. Process Response and Update Database**
    let results = [];
    for (let i = 0; i < uploadedImages.length; i++) {
      const imgData = uploadedImages[i];
      const predictionData = flaskResponse.data[i]; // Match image with its prediction
      const diagnosisResult = predictionData.prediction.label;
      const confidencelevel = predictionData.prediction.confidence;

      // Find corresponding patient
      let patient = existingPatients.find(
        (p) => p.patientId === imgData.patientId
      );
      patient.diagnoseHistory.push({
        imageUrl: imgData.imageUrl,
        diagnosis: diagnosisResult,
        confidenceScores: confidencelevel,
      });
      await patient.save();

      results.push({
        patientId: imgData.patientId,
        imageUrl: imgData.imageUrl,
        diagnosis: diagnosisResult,
        confidenceScores: confidencelevel,
        patientDetails: patient,
      });
    }

    res.json({ message: "Upload and Diagnosis Complete", results });
  } catch (error) {
    console.error("Error in uploadImages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.multiImageSave = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    // Extract unique patient IDs from filenames
    let patientIds = [
      ...new Set(req.files.map((file) => path.parse(file.originalname).name)),
    ];

    // Find all patients from the database
    let existingPatients = await Patient.find({
      patientId: { $in: patientIds },
    });

    // Identify missing patient IDs
    let existingPatientIds = new Set(existingPatients.map((p) => p.patientId));
    let missingPatientIds = patientIds.filter(
      (id) => !existingPatientIds.has(id)
    );

    // If any patient ID is missing, return the unavailable list
    if (missingPatientIds.length > 0) {
      return res
        .status(400)
        .json({ error: "Unavailable Patient IDs", missingPatientIds });
    }

    // **1. Prepare FormData and Send All Images to Flask API**
    const formData = new FormData();
    req.files.forEach((file) => {
      formData.append("files", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    const flaskResponse = await axios.post(
      process.env.FLASK_API_URL_2,
      formData,
      { headers: { ...formData.getHeaders() } }
    );

    console.log("Flask Response:", flaskResponse.data);

    // **2. Process Flask API Response**
    let results = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const predictionData = flaskResponse.data[i]; // Match image with prediction
      const diagnosisResult = predictionData.prediction.label;
      const confidencelevel = predictionData.prediction.confidence;
      const filename = predictionData.filename;

      // Find corresponding patient
      let patient = existingPatients.find(
        (p) => p.patientId === path.parse(file.originalname).name
      );

      results.push({
        patientId: path.parse(file.originalname).name,
        diagnosis: diagnosisResult,
        filename: filename,
        confidenceScores: confidencelevel,
        patientDetails: patient,
      });
    }

    res.status(200).json({ message: "Analysis Complete", results });
  } catch (error) {
    console.error("Error in analyzeImages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.saveMultipleDiagnoses = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    if (!req.body.diagnosisData || !req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ error: "No diagnosis data or images provided" });
    }

    const diagnosisData = JSON.parse(req.body.diagnosisData);
    const category = req.body.category;

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    let results = [];

    for (let diagnosisEntry of diagnosisData) {
      const { patientId, diagnosis, confidenceScores } = diagnosisEntry;

      const file = req.files.find((f) => f.originalname.includes(patientId));

      if (!file) {
        console.error(`No image found for Patient ID: ${patientId}`);
        continue;
      }

      let patient = await Patient.findOne({ patientId });

      if (!patient) {
        console.error(`Patient not found: ${patientId}`);
        continue;
      }

      console.log(`Updating Patient: ${patientId}`);

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `diagnosis_images/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const uploadResult = await s3.upload(params).promise();
      const imageUrl = uploadResult.Location;

      if (!patient.category.includes(category)) {
        patient.category.push(category);
      }

      patient.diagnoseHistory.push({
        imageUrl,
        diagnosis,
        confidenceScores,
      });

      patient.patientStatus = "Pre-Monitoring";

      await patient.save();

      results.push({
        patientId,
        category,
        imageUrl,
        diagnosis,
        confidenceScores,
      });
    }

    res.json({
      message: "All diagnosis records saved successfully",
      results,
    });
  } catch (error) {
    console.error("Error in saveMultipleDiagnoses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updatePatientDiagnosis = async (req, res) => {
  try {
    // Check for required fields
    if (
      !req.file ||
      !req.body.confidenceScores ||
      !req.body.recommend ||
      !req.body.category ||
      !req.body.diagnosis
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    console.log(req.body.diagnosis);

    // Extract patient ID from filename (e.g., 12345_jndj.jpg → 12345)
    const filename = req.file.originalname;
    const match = filename.match(/^([^_]+)_(left|right)_/i);

    if (!match) {
      return res.status(400).json({
        error:
          "Invalid filename format. Expected: patientId_LEFTorRIGHT_randomtext.jpg",
      });
    }

    const patientId = match[1];
    console.log(`Extracted Patient ID: ${patientId}`);
    const sideIdentifier = match[2].toUpperCase();

    // Find the patient
    let patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Upload image to S3
    const s3Key = `diagnosis_images/${uuidv4()}_${req.file.originalname}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    const uploadResult = await s3.upload(params).promise();
    const imageUrl = uploadResult.Location;

    // Parse confidenceScores as an array of numbers
    let confidenceScores;
    try {
      confidenceScores = JSON.parse(req.body.confidenceScores).map(Number);
    } catch (error) {
      return res.status(400).json({ error: "Invalid confidenceScores format" });
    }

    // Parse and validate recommend field
    let recommend;
    try {
      recommend = JSON.parse(req.body.recommend);
      if (
        typeof recommend.medicine !== "string" || // Must be a string
        !Array.isArray(recommend.tests) || // Must be an array
        !recommend.tests.every(
          (test) =>
            typeof test.testName === "string" &&
            ["Pending", "In Progress", "Completed", "TestCompleted"].includes(
              test.status
            ) &&
            typeof test.attachmentURL === "string"
        ) ||
        typeof recommend.note !== "string" // Must be a string
      ) {
        return res.status(400).json({ error: "Invalid recommend format" });
      }
    } catch (error) {
      return res.status(400).json({ error: "Invalid recommend JSON format" });
    }

    // Ensure category is an array
    const category = Array.isArray(req.body.category)
      ? req.body.category
      : [req.body.category];

    // Update patient record
    patient.diagnoseHistory.push({
      imageUrl,
      diagnosis: req.body.diagnosis,
      confidenceScores,
      category,
      eye: sideIdentifier,
      recommend, // Use the parsed recommend object directly
      status: "Checked", // Default from schema
    });

    await patient.save();

    // Response with consistent status
    res.json({
      message: "Patient diagnosis updated successfully",
      patientId,
      imageUrl,
      diagnosis: req.body.diagnosis,
      confidenceScores,
      category,
      recommend,
      status: "Checked", // Match the pushed status
    });
  } catch (error) {
    console.error("Error in updatePatientDiagnosis:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

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
      return res.status(404).json({ error: "No patients found" });
    }

    // Response structure similar to your existing functions
    res.json({
      message: "Patients retrieved successfully",
      data: patients,
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

    // Validate patientId
    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    // Fetch patient from database
    const patient = await Patient.findOne({ patientId })
      .lean() // Use lean for performance (returns plain JS object)
      .select("-__v"); // Exclude version key

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
      status, // New parameter to specify patientStatus
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
