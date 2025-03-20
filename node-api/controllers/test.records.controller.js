const Patient = require("../models/patient");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

// Get test records for a patient (return all records with non-empty tests)
const getTestRecords = asyncHandler(async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId });

    if (!patient) {
      res.status(404);
      throw new Error("Patient not found");
    }

    // Return all records with non-empty tests array, regardless of status
    const allRecords = patient.diagnoseHistory.filter((record) => {
      return (
        record.recommend &&
        Array.isArray(record.recommend.tests) &&
        record.recommend.tests.length > 0
      );
    });

    res.status(200).json({
      success: true,
      data: allRecords,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch test records: " + error.message);
  }
});

// Upload test attachment to S3
const uploadTestAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file provided");
  }

  const file = req.file;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
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
// backend controller - updateTestStatus
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

  // Prevent any status change if no attachment exists or is provided
  if (test.status !== status) { // Check if status is actually changing
    if (!test.attachmentURL && !attachmentURL) {
      res.status(400);
      throw new Error("An attachment is required to change the test status");
    }
  }

  // Update status and attachment if provided
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

  // Check if the specific diagnosis has "Checked" status
  if (diagnose.status !== "Checked") {
    res.status(400);
    throw new Error(`Diagnosis status is ${diagnose.status}, expected 'Checked' to complete`);
  }

  // Check if all tests for this diagnosis are completed or reviewed
  const incompleteTests = diagnose.recommend.tests.filter(
    (test) => test.status !== "Completed" && test.status !== "Reviewed"
  );
  if (incompleteTests.length > 0) {
    res.status(400);
    throw new Error(
      `Not all tests are completed or reviewed. Incomplete tests: ${incompleteTests
        .map((test) => `${test.testName} (${test.status})`)
        .join(", ")}`
    );
  }

  // Update the diagnosis status to "Test Completed"
  diagnose.status = "Test Completed";

  // Check for remaining "Checked" diagnoses with non-empty tests arrays
  const remainingCheckedDiagnosesWithTests = patient.diagnoseHistory.filter(
    (d) =>
      d.status === "Checked" &&
      d._id.toString() !== diagnoseId && // Exclude the current diagnosis
      d.recommend && // Ensure recommend exists
      Array.isArray(d.recommend.tests) && // Ensure tests is an array
      d.recommend.tests.length > 0 // Ensure tests array is not empty
  ).length;

  console.log("Remaining Checked Diagnoses with Tests:", remainingCheckedDiagnosesWithTests);

  if (remainingCheckedDiagnosesWithTests === 0) {
    // If no other "Checked" diagnoses with tests remain, update patient status
    patient.patientStatus = "Published";
  }

  // Save the changes
  await patient.save();

  res.status(200).json({
    success: true,
    message: "Diagnosis and patient updated",
    data: { diagnose, patientStatus: patient.patientStatus },
  });
});

module.exports = {
  getTestRecords,
  uploadTestAttachment,
  updateTestStatus,
  completeDiagnosis,
};