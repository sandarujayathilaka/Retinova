const mongoose = require("mongoose");

// Schema for past diagnoses
const diagnoseSchema = new mongoose.Schema({
  imageUrl: String,
  diagnosis: { type: String, default: "Processing" },
  uploadedAt: { type: Date, default: Date.now },
  confidenceScores: [Number], // Store confidence scores for transparency
});

// Schema for patient medical history
const medicalHistorySchema = new mongoose.Schema({
  condition: String, // Example: "Diabetes", "Hypertension"
  diagnosedAt: Date,
  medications: [String], // Example: ["Metformin", "Insulin"]
});

// Main Patient Schema
const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: false },
    address: { type: String, required: false },

    medicalHistory: [medicalHistorySchema], // Array of medical history entries
    diagnoseHistory: [diagnoseSchema], // Array of past diagnoses
  },
  { timestamps: true }
); // Automatically adds createdAt & updatedAt fields

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
