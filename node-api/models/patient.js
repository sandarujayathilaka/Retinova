


// // Main Patient Schema
// const patientSchema = new mongoose.Schema(
//   {
//     patientId: { type: String, required: true, unique: true },
//     fullName: { type: String, required: true },
//     category: { type: [String], enum: ["DR", "AMD", "Glaucoma", "RVO", "Others"] },
//     birthDate: {
//       type: Date,
//       required: true,
//     },
//     age: {
//       type: Number, // Added age field to store pre-computed age
//     },
//     gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
//     contactNumber: { type: String, required: true },
//     email: { type: String, required: false, lowercase: true },
//     address: { type: String, required: true },
//     nic: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     medicalHistory: [medicalHistorySchema], // Array of medical history entries
//     diagnoseHistory: [diagnoseSchema], // Array of past diagnoses
//   },
//   { timestamps: true }
// ); // Automatically adds createdAt & updatedAt fields

const mongoose = require("mongoose");


const diagnoseSchema = new mongoose.Schema({
  imageUrl: String,
  diagnosis: { type: String, default: "Processing" },
  uploadedAt: { type: Date, default: Date.now },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  status: {
    type: String,
    enum: ["Unchecked", "Completed","Checked"],
    default: "Unchecked",
  },
  confidenceScores: [Number],
  recommend: {
    medicine: String,
    tests: [
      {
        testName: String,
        status: {
          type: String,
          enum: ["Pending", "In Progress", "Completed"],
          default: "Pending",
        },
        attachmentURL: String,
      },
    ],
    note: { type: String },
  },
});


// Schema for patient medical history
const medicalHistorySchema = mongoose.Schema(
  {
    condition: {
      type: String,
      required: true,
    },
    diagnosedAt: Date,
    medications: [String],
    date: {
      type: Date,
      default: Date.now,
    },
    filePaths: {
      type: [String], 
      default: [],
    },
  },
  { timestamps: true }
);
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

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
    birthDate: {
      type: Date,
      required: true,
      index: true,
    },
    age: { type: Number, required: false, index: true }, // Index for range queries
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
      index: true,
    }, // Index for filtering
    nic: {
      type: String,
      required: true,
      unique: true,
    },
    contactNumber: { type: String, required: true },
    email: { type: String, required: false },
    address: { type: String, required: false },
    medicalHistory: [medicalHistorySchema],
    diagnoseHistory: [diagnoseSchema],
    patientStatus: {
      type: String,
      enum: ["Pre-Monitoring", "Published", "Review", "Completed", "Monitoring"],
      default: "Monitoring",
      index: true,
    },
    nextVisit: { type: Date },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

patientSchema.index({ birthDate: 1 });
patientSchema.pre("save", function (next) {
  if (this.birthDate && !isNaN(new Date(this.birthDate))) {
    this.age = calculateAge(this.birthDate);
  } else {
    this.age = undefined; // or handle the error appropriately
  }
  next();
});


// Compound index for common query combinations (optional)
patientSchema.index({ category: 1, gender: 1 }); // For queries filtering by both category and gender
patientSchema.index({ age: 1, createdAt: -1 }); // For sorting by age and creation date

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;