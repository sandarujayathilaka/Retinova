const Patient = require("../models/patient");
const s3 = require("../config/s3");
const axios = require("axios");
require("dotenv").config();
const path = require("path");

const FormData = require("form-data"); // Import FormData

exports.uploadImage = async (req, res) => {
  try {
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
      process.env.FLASK_API_URL,
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
    const filename = req.file.originalname; // Example: "123456_jndfdkj.jpg"
    const patientIdMatch = filename.match(/^(\d+)_/); // Regex to extract numbers before '_'

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

    // **3. Prepare Image for Flask API**
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // **4. Call Flask API for Prediction**
    const flaskResponse = await axios.post(
      process.env.FLASK_API_URL,
      formData,
      { headers: { ...formData.getHeaders() } }
    );

    const diagnosisResult = flaskResponse.data.label; // Extract diagnosis label
    const confidence = flaskResponse.data.confidence; // Confidence scores

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

    // **1. Parse diagnosis data**
    const diagnosisData = JSON.parse(req.body.diagnosisData);
    const category = req.body.category; // Extract category from request

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    let results = [];

    // **2. Loop through each diagnosis entry**
    for (let diagnosisEntry of diagnosisData) {
      const { patientId, diagnosis, confidenceScores } = diagnosisEntry;

      // **3. Find the matching image file using patientId**
      const file = req.files.find((f) => f.originalname.includes(patientId));

      if (!file) {
        console.error(`No image found for Patient ID: ${patientId}`);
        continue; // Skip this entry if no matching image is found
      }

      // **4. Find the patient in the database**
      let patient = await Patient.findOne({ patientId });

      if (!patient) {
        console.error(`Patient not found: ${patientId}`);
        continue;
      }

      console.log(`Updating Patient: ${patientId}`);

      // **5. Upload Image to AWS S3**
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `diagnosis_images/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const uploadResult = await s3.upload(params).promise();
      const imageUrl = uploadResult.Location;

      // **6. Ensure category is added to patient's record (if not already present)**
      if (!patient.category.includes(category)) {
        patient.category.push(category);
      }

      // **7. Update DiagnoseHistory with category**
      patient.diagnoseHistory.push({
        imageUrl,
        diagnosis,
        confidenceScores,
      });

      // **8. Save Changes to Database**
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
