const mongoose = require("mongoose");

const WorkingHourSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, required: true },
    startTime: { type: String },
    endTime: { type: String },
  },
  { _id: false }
);

const ImageSchema = new mongoose.Schema(
  {
    ETag: { type: String },
    ServerSideEncryption: { type: String },
    Location: { type: String, required: true },
    key: { type: String, required: true },
    Key: { type: String, required: true },
    Bucket: { type: String },
  },
  { _id: false }
);

const DayOffSchema = new mongoose.Schema(
  {
    dayOffName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    repeatYearly: { type: Boolean, required: true },
  },
  { _id: false }
);

const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["Full time", "Part time"],
    },
    status: {
      type: Boolean,
      default: false,
    },
    specialty: {
      type: String,
      required: true,
      enum: [
        "Ophthalmologist",
        "Optometrist",
        "Retina Specialist",
        "Cornea Specialist",
        "Glaucoma Specialist",
        "Pediatric Ophthalmologist",
        "Neuro-Ophthalmologist",
        "Oculoplastic Surgeon",
        "Ocular Oncologist",
        "Contact Lens Specialist",
      ],
    },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    workingHours: {
      Monday: { type: WorkingHourSchema, required: true },
      Tuesday: { type: WorkingHourSchema, required: true },
      Wednesday: { type: WorkingHourSchema, required: true },
      Thursday: { type: WorkingHourSchema, required: true },
      Friday: { type: WorkingHourSchema, required: true },
      Saturday: { type: WorkingHourSchema, required: true },
      Sunday: { type: WorkingHourSchema, required: true },
    },
    image: { type: ImageSchema, required: true },
    daysOff: { type: [DayOffSchema], default: [] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to User model
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model("Doctor", DoctorSchema);

module.exports = Doctor;
