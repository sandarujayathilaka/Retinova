const mongoose = require("mongoose");

const diagnoseSchema = new mongoose.Schema({
  imageUrl: String,
  diagnosis: { type: String, default: "Processing" },
  uploadedAt: { type: Date, default: Date.now },
  status: { type: String, default: "Unchecked" },
  confidenceScores: [Number],
  recommend: {
    medicine: String,
    tests: [
      {
        testName: String,
        status: { type: String, default: "Pending" }, // Example statuses: "Pending", "Completed", "In Progress"
        attachmentURL: String,
      },
    ],
    note: { type: String },
  },
});


// Schema for patient medical history
const medicalHistorySchema = new mongoose.Schema({
  condition: String,
  diagnosedAt: Date,
  medications: [String],
});

// Main Patient Schema with Indexes
const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true }, // Unique index automatically created
    fullName: { type: String, required: true, index: true }, // Single field index for search
    category: {
      type: [String],
      enum: ["DR", "AMD", "Glaucoma", "RVO", "Others"],
      index: true,
    }, // Index for filtering
    age: { type: Number, required: true, index: true }, // Index for range queries
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
      index: true,
    }, // Index for filtering
    contactNumber: { type: String, required: true },
    email: { type: String, required: false },
    address: { type: String, required: false },
    medicalHistory: [medicalHistorySchema],
    diagnoseHistory: [diagnoseSchema],
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

// Compound index for common query combinations (optional)
patientSchema.index({ category: 1, gender: 1 }); // For queries filtering by both category and gender
patientSchema.index({ age: 1, createdAt: -1 }); // For sorting by age and creation date

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
