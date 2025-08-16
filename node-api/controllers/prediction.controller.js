const Patient = require("../models/patient");
const { s3 } = require("../config/aws");
const axios = require("axios");
require("dotenv").config();
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const FormData = require("form-data"); // Import FormData



/**
 * @route   POST /api/predict/fetch
 * @desc    Uploads a single fundus image, extracts patient ID from the filename,
 *          verifies the patient exists, and performs disease prediction using the specified disease type
 *          (AMD, DR, RVO, or Glaucoma). Returns diagnosis, confidence scores, and patient details.
 */

exports.SingleImagePredictAndFetch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    //Extract Patient ID from Image Filename
    const filename = req.file.originalname; // Example: "abc123y_right_tye785.jpg"
    const patientIdMatch = filename.match(/^([^_]+)_/); // Regex to capture everything before the first '_'

    if (!patientIdMatch) {
      return res.status(400).json({
        error:
          "Invalid filename format. Expected: patientId_eyeside_randomtext.jpg",
      });
    }

    const patientId = patientIdMatch[1]; // Extracted patient ID
    console.log(`Extracted Patient ID: ${patientId}`);

    //Check if the Patient Exists in MongoDB
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

    //Prepare Image for Flask API**
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    //Call Flask API for Prediction
    const flaskResponse = await axios.post(flaskApiUrl, formData, {
      headers: { ...formData.getHeaders() },
    });

    console.log("Flask Response:", flaskResponse.data);

    let diagnosisResult;
    if (diseaseType == "glaucoma") {
      diagnosisResult = flaskResponse.data.class;
    } else {
      diagnosisResult = flaskResponse.data.label;
    }

    const confidence = flaskResponse.data.confidence; // Confidence scores
    console.log(flaskResponse);
    console.log(confidence);

    res.json({
      message: "Prediction Successful",
      diagnosis: diagnosisResult,
      confidenceScores: confidence,
      patientData: patient,
    });
  } catch (error) {
    console.error("Error in prediction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


/**
 * @route   POST /api/predict/multiImagePrediction
 * @desc    Handles multiple fundus image uploads for prediction based on a specified disease type 
 *          (AMD, DR, RVO, or Glaucoma) and returns diagnostic results with confidence scores.
 */

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
      const match = file.originalname.match(
        /^(.*?)_(LEFT|RIGHT)_.*?\.(jpg|jpeg|png)$/i
      );
      if (!match) {
        throw new Error(`Invalid filename format: ${file.originalname}`);
      }
      return {
        patientId: match[1],
        eyeSide: match[2],
        filename: file.originalname,
      };
    });

    let patientIds = [...new Set(patientData.map((data) => data.patientId))];

    // Find all patients from the database
    let existingPatients = await Patient.find({
      patientId: { $in: patientIds },
    });
    let existingPatientIds = new Set(existingPatients.map((p) => p.patientId));
    let missingPatientIds = patientIds.filter(
      (id) => !existingPatientIds.has(id)
    );

    if (missingPatientIds.length > 0) {
      return res
        .status(400)
        .json({ error: "Unavailable Patient IDs", missingPatientIds });
    }

    // Prepare FormData and send images to Flask API
    const formData = new FormData();
    req.files.forEach((file) => {
      formData.append("files", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    const flaskResponse = await axios.post(flaskApiUrl, formData, {
      headers: { ...formData.getHeaders() },
    });
    console.log("Flask Response:", flaskResponse.data);

    // Process Flask API Response
    let results = req.files.map((file, index) => {
      const isGlaucoma = diseaseType.toLowerCase() === "glaucoma";
      const predictionData = isGlaucoma
        ? flaskResponse.data.results[index] // Glaucoma has "results" array
        : flaskResponse.data[index]; // DR, AMD, RVO are direct array

      const { patientId, eyeSide } = patientData[index];
      let patient = existingPatients.find((p) => p.patientId === patientId);

      // Determine diagnosis and confidence based on diseaseType
      const diagnosis = isGlaucoma
        ? predictionData.class // Glaucoma uses "class"
        : predictionData.prediction.label; // Others use "prediction.label"

      const confidenceScores = isGlaucoma
        ? predictionData.confidence // Glaucoma uses "probabilities" object
        : predictionData.prediction.confidence; // Others use "prediction.confidence" array

      return {
        patientId,
        eyeSide,
        diagnosis,
        filename: predictionData.filename,
        confidenceScores,
        patientDetails: patient,
      };
    });

    res.status(200).json({ message: "Analysis Complete", results });
  } catch (error) {
    console.error("Error in analyzeImages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



/**
 * @route   POST /api/diagnoses/update
 * @desc    Updates a specific patient's diagnosis by:
 *          - Extracting patientId from the uploaded image filename
 *          - Validating and parsing confidence scores and recommendation object
 *          - Uploading the image to AWS S3
 *          - Adding diagnosis details to the patient's diagnoseHistory
 *          - Updating the patient's status and category list
 */

exports.updatePatientDiagnosis = async (req, res) => {
  try {
    // Check for required fields

    console.log(req.currentUser);
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
      doctorId: "67d7127ed060b20213da7cb9",
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


/**
 * @route   PUT /api/patients/:patientId/diagnoses/:diagnosisId/recommendations
 * @desc    Updates recommendations (medicine, tests, note) for a specific diagnosis of a patient.
 *          - Validates required fields (allows empty values for marking as checked)
 *          - Finds the patient and diagnosis by IDs
 *          - Prevents updates if diagnosis is already "Checked" or "Completed"
 *          - Normalizes medicine field to string
 *          - Updates recommendation details and marks diagnosis as "Checked"
 *          - Updates patient status to "Monitoring" if no "Unchecked" diagnoses remain
 */

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



/**
 * @route   PUT /api/patients/:patientId/diagnoses/:diagnosisId/review
 * @desc    Adds review information and additional tests to a specific diagnosis of a patient.
 *          - Validates presence of reviewInfo with at least recommendedMedicine or notes
 *          - Ensures the patient exists and diagnosis is found
 *          - Only allows review updates when patient status is "Review"
 *          - Appends new review objects to diagnosis.reviewInfo array
 *          - Adds new tests to diagnosis.recommend.tests with status "Pending"
 *          - Updates revisitTimeFrame if provided
 *          - Updates diagnosis status to "Checked"
 *          - Updates patient status depending on pending tests and optional doctorStatus
 */


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



/**
 * @route   PUT /api/patients/:patientId/diagnoses/:diagnosisId/tests/:testId/status
 * @desc    Update the status of a specific test within a diagnosis for a patient.
 *          - Validates that the status is one of the allowed values
 *          - Finds the patient and diagnosis by their IDs
 *          - Finds the test within the diagnosis's recommend.tests array by testId
 *          - Updates the test status and saves the patient document
 */


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


/**
 * @route   POST /api/diagnoses/multiDataSave
 * @desc    Saves multiple diagnosis records for patients by associating uploaded images,
 *          parsed diagnosis data (including confidence scores), and other metadata such as eye side
 *          and doctor ID. Also uploads images to S3 and updates patient status to "Pre-Monitoring".
 */

exports.saveMultipleDiagnoses = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Request Body:", req.files);

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

      const file = req.files.find((f) => {
        // Updated regex to support multiple image extensions
        const match = f.originalname.match(
          /^(.+?)_(left|right)_.*?(\.jpg|\.png|\.jpeg)$/i
        );
        console.log(`Matching ${f.originalname} for ${patientId}:`, match);
        return match && match[1] === patientId;
      });

      console.log(req.currentUser.profileId);

      if (!file) {
        console.error(`No image found for Patient ID: ${patientId}`);
        continue;
      }

      // Extract eye side from the second capture group
      let eyeSide = file.originalname.match(
        /^(.+?)_(left|right)_.*?(\.jpg|\.png|\.jpeg)$/i
      )?.[2];

      if (!eyeSide) {
        console.error(
          `Could not determine eye side for Patient ID: ${patientId}`
        );
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
        doctorId: "67d7127ed060b20213da7cb9",
        eye: eyeSide.toUpperCase(),
      });

      patient.patientStatus = "Pre-Monitoring";

      await patient.save();

      results.push({
        patientId,
        category,
        imageUrl,
        diagnosis,
        confidenceScores,
        eyeSide,
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