const Patient = require("../models/patient");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

// Get test records for a patient
const getTestRecords = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ patientId: req.params.patientId });
  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }

  const checkedRecords = patient.diagnoseHistory.filter((record) => record.status === "Checked");
  res.status(200).json({
    success: true,
    data: checkedRecords,
  });
});

// Upload test attachment to S3
const uploadTestAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file provided");
  }

  const file = req.file;
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `${uuidv4()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const uploadResult = await s3.upload(params).promise();
  res.status(200).json({
    success: true,
    data: { attachmentURL: uploadResult.Location },
  });
});

// Update test status and attachment
const updateTestStatus = asyncHandler(async (req, res) => {
  const { patientId, diagnoseId, testIndex, status, attachmentURL } = req.body;

  if (!patientId || !diagnoseId || testIndex === undefined || !status) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const patient = await Patient.findOne({ patientId });
  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }

  const diagnose = patient.diagnoseHistory.id(diagnoseId);
  if (!diagnose) {
    res.status(404);
    throw new Error("Diagnosis not found");
  }

  const test = diagnose.recommend.tests[testIndex];
  if (!test) {
    res.status(404);
    throw new Error("Test not found");
  }

  test.status = status;
  if (attachmentURL) test.attachmentURL = attachmentURL;

  await patient.save();

  res.status(200).json({
    success: true,
    message: "Test updated successfully",
    data: diagnose,
  });
});

// Complete diagnosis and update patient status
const completeDiagnosis = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { diagnoseId } = req.body;

  if (!diagnoseId) {
    res.status(400);
    throw new Error("Diagnosis ID is required");
  }

  const patient = await Patient.findOne({ patientId });
  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }

  const diagnose = patient.diagnoseHistory.id(diagnoseId);
  if (!diagnose) {
    res.status(404);
    throw new Error("Diagnosis not found");
  }

  // Check if all tests are completed
  const allTestsCompleted = diagnose.recommend.tests.every((test) => test.status === "Completed");
  if (!allTestsCompleted) {
    res.status(400);
    throw new Error("Not all tests are completed");
  }

  // Update both statuses atomically
  diagnose.status = "TestCompleted";
  patient.patientStatus = "ReviewReady";

  await patient.save();

  res.status(200).json({
    success: true,
    message: "Diagnosis completed and patient status updated",
    data: { diagnose, patientStatus: patient.patientStatus },
  });
});

module.exports = {
  getTestRecords,
  uploadTestAttachment,
  updateTestStatus,
  completeDiagnosis,
};