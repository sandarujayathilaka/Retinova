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
        error: "Invalid filename format. Expected: patientId_eyeside_randomtext.jpg",
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

    const { diseaseType } = req.body;
    if (
      !diseaseType ||
      !["amd", "dr", "rvo", "glaucoma"].includes(diseaseType.toLowerCase())
    ) {
      return res.status(400).json({
        error:
          "Invalid or missing diseaseType parameter. Use 'amd', 'dr', 'rvo', or 'glaucoma'.",
      });
    }

    const flaskApiUrl = {
      amd: process.env.FLASK_API_AMD_Multi,
      dr: process.env.FLASK_API_DR_Multi,
      rvo: process.env.FLASK_API_RVO_Multi,
      glaucoma: process.env.FLASK_API_GLAUCOMA_Multi,
    }[diseaseType.toLowerCase()];

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
     flaskApiUrl,
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
console.log("images",results);
    res.json({ message: "Upload and Diagnosis Complete", results });
  } catch (error) {
    console.error("Error in uploadImages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// exports.multiImageSave = async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: "No images uploaded" });
//     }

//     // Extract patientId and eyeSide from filenames
//     let patientData = req.files.map((file) => {
//       const match = file.originalname.match(/^(.*?)_(LEFT|RIGHT)_.*?\.jpg$/);
//       if (!match) {
//         throw new Error(`Invalid filename format: ${file.originalname}`);
//       }
//       return { patientId: match[1], eyeSide: match[2], filename: file.originalname };
//     });

//     let patientIds = [...new Set(patientData.map((data) => data.patientId))];

//     // Find all patients from the database
//     let existingPatients = await Patient.find({ patientId: { $in: patientIds } });
//     let existingPatientIds = new Set(existingPatients.map((p) => p.patientId));
//     let missingPatientIds = patientIds.filter((id) => !existingPatientIds.has(id));

//     if (missingPatientIds.length > 0) {
//       return res.status(400).json({ error: "Unavailable Patient IDs", missingPatientIds });
//     }

//     // Prepare FormData and send images to Flask API
//     const formData = new FormData();
//     req.files.forEach((file) => {
//       formData.append("files", file.buffer, { filename: file.originalname, contentType: file.mimetype });
//     });

//     const flaskResponse = await axios.post(process.env.FLASK_API_URL_2, formData, { headers: { ...formData.getHeaders() } });
//     console.log("Flask Response:", flaskResponse.data);

//     // Process Flask API Response
//     let results = req.files.map((file, index) => {
//       const predictionData = flaskResponse.data[index];
//       const { patientId, eyeSide } = patientData[index];
//       let patient = existingPatients.find((p) => p.patientId === patientId);

//       return {
//         patientId,
//         eyeSide, // Store eye side
//         diagnosis: predictionData.prediction.label,
//         filename: predictionData.filename,
//         confidenceScores: predictionData.prediction.confidence,
//         patientDetails: patient,
//       };
//     });

//     res.status(200).json({ message: "Analysis Complete", results });
//   } catch (error) {
//     console.error("Error in analyzeImages:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

exports.multiImagePrediction = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const { diseaseType } = req.body;
    if (
      !diseaseType ||
      !["amd", "dr", "rvo", "glaucoma"].includes(diseaseType.toLowerCase())
    ) {
      return res.status(400).json({
        error:
          "Invalid or missing diseaseType parameter. Use 'amd', 'dr', 'rvo', or 'glaucoma'.",
      });
    }

    const flaskApiUrl = {
      amd: process.env.FLASK_API_AMD_Multi,
      dr: process.env.FLASK_API_DR_Multi,
      rvo: process.env.FLASK_API_RVO_Multi,
      glaucoma: process.env.FLASK_API_GLAUCOMA_Multi,
    }[diseaseType.toLowerCase()];

    // Extract patientId and eyeSide from filenames
    let patientData = req.files.map((file) => {
      const match = file.originalname.match(/^(.*?)_(LEFT|RIGHT)_.*?\.(jpg|jpeg|png)$/i);
      if (!match) {
        throw new Error(`Invalid filename format: ${file.originalname}`);
      }
      return { patientId: match[1], eyeSide: match[2], filename: file.originalname };
    });

    let patientIds = [...new Set(patientData.map((data) => data.patientId))];

    // Find all patients from the database
    let existingPatients = await Patient.find({ patientId: { $in: patientIds } });
    let existingPatientIds = new Set(existingPatients.map((p) => p.patientId));
    let missingPatientIds = patientIds.filter((id) => !existingPatientIds.has(id));

    if (missingPatientIds.length > 0) {
      return res.status(400).json({ error: "Unavailable Patient IDs", missingPatientIds });
    }

    // Prepare FormData and send images to Flask API
    const formData = new FormData();
    req.files.forEach((file) => {
      formData.append("files", file.buffer, { filename: file.originalname, contentType: file.mimetype });
    });

    const flaskResponse = await axios.post(flaskApiUrl, formData, { headers: { ...formData.getHeaders() } });
    console.log("Flask Response:", flaskResponse.data);

    // Process Flask API Response
    let results = req.files.map((file, index) => {
      const predictionData = flaskResponse.data[index];
      const { patientId, eyeSide } = patientData[index];
      let patient = existingPatients.find((p) => p.patientId === patientId);

      return {
        patientId,
        eyeSide, // Store eye side
        diagnosis: predictionData.prediction.label,
        filename: predictionData.filename,
        confidenceScores: predictionData.prediction.confidence,
        patientDetails: patient,
      };
    });
console.log("mulyi",results)
    res.status(200).json({ message: "Analysis Complete", results });
  } catch (error) {
    console.error("Error in analyzeImages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.saveMultipleDiagnoses = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Request Body:", req.files);

    if (!req.body.diagnosisData || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No diagnosis data or images provided" });
    }

    const diagnosisData = JSON.parse(req.body.diagnosisData);
    const category = req.body.category;

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    let results = [];


    for (let diagnosisEntry of diagnosisData) {
      const { patientId, diagnosis, confidenceScores } = diagnosisEntry;
      
      const file = req.files.find((f) => {
        const match = f.originalname.match(/^(.+?)_(left|right)_.*?\.jpg$/i); 
        console.log(match);
        return match && match[1] === patientId;
      });

      if (!file) {
        console.error(`No image found for Patient ID: ${patientId}`);
        continue;
      }

      let eyeSide = file.originalname.match(/^(.+?)_(left|right)_.*?\.jpg$/i)?.[2];

      if (!eyeSide) {
        console.error(`Could not determine eye side for Patient ID: ${patientId}`);
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
        eye: eyeSide.toUpperCase(), // Store eye side
      });

      patient.patientStatus = "Pre-Monitoring";

      await patient.save();

      results.push({
        patientId,
        category,
        imageUrl,
        diagnosis,
        confidenceScores,
        eyeSide
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
    console.log("Raw req.body.category:", req.body.category);

    // Extract patient ID from filename (e.g., P1_left_image.jpg → P1)
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
        typeof recommend.medicine !== "string" ||
        !Array.isArray(recommend.tests) ||
        !recommend.tests.every(
          (test) =>
            typeof test.testName === "string" &&
            ["Pending", "In Progress", "Completed", "Test Completed"].includes(
              test.status
            ) &&
            typeof test.attachmentURL === "string"
        ) ||
        typeof recommend.note !== "string"
      ) {
        return res.status(400).json({ error: "Invalid recommend format" });
      }
    } catch (error) {
      return res.status(400).json({ error: "Invalid recommend JSON format" });
    }

    // Define valid categories
    const validCategories = ["DR", "AMD", "Glaucoma", "RVO", "Others"];

    // Normalize category to an array (handle single string like "DR")
    const category = Array.isArray(req.body.category)
      ? req.body.category
      : [req.body.category];
    console.log("Processed category:", category);

    // Validate category
    if (!category.every((cat) => validCategories.includes(cat))) {
      return res.status(400).json({ error: "Invalid category value" });
    }

    // Update root-level patient.category (add new categories if not already present)
    patient.category = [...new Set([...patient.category, ...category])]; 

    patient.patientStatus = "Monitoring";

    // Push new diagnosis into diagnoseHistory
    patient.diagnoseHistory.push({
      imageUrl,
      diagnosis: req.body.diagnosis,
      confidenceScores,
      eye: sideIdentifier,
      recommend,
      status: "Checked",
    });

    // Save the updated patient document
    await patient.save();

    // Response with consistent status
    res.json({
      message: "Patient diagnosis updated successfully",
      patientId,
      imageUrl,
      diagnosis: req.body.diagnosis,
      confidenceScores,
      category: patient.category,
      recommend,
      status: "Checked",
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
    console.log("Patient ID:", patientId);

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


exports.updateDiagnosisReviewRecommendations = async (req, res) => {
  try {
    const { patientId, diagnosisId } = req.params;
    const { reviewInfo, additionalTests, doctorStatus } = req.body;

    // Validate required fields (optional depending on your needs)
    if (!reviewInfo || (!reviewInfo.recommendedMedicine && !reviewInfo.notes)) {
      return res.status(400).json({
        error: "At least one of recommendedMedicine or notes is required in reviewInfo",
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
      ["Pre-Monitoring", "Published", "Review", "Completed", "Monitoring"].includes(
        doctorStatus
      )
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
        error: "Invalid status. Must be one of: Pending, In Progress, Completed, Reviewed",
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
    res.status(500).json({ error: "Internal Server Error", details: error.message });
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


