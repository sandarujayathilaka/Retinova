const Doctor = require("../models/doctor.model");
const UserService = require("../services/user.service");
const Patient = require("../models/patient");
const mongoose = require("mongoose");

const addDoctor = async (req, res) => {
  const {
    name,
    type,
    specialty,
    phone,
    email,
    address,
    workingHours,
    image,
    daysOff,
  } = req.body;

  const existingDoctor = await Doctor.findOne({ email });

  if (existingDoctor) {
    return res
      .status(400)
      .json({ error: "Doctor with this email already exists" });
  }

  const doctor = new Doctor({
    name,
    type,
    specialty,
    phone,
    email,
    address,
    workingHours,
    image,
    daysOff,
  });

  await doctor.save();

  await UserService.createUser(email, "doctor", doctor._id, name);

  res.status(201).json({ message: "Doctor added successfully", doctor });
};

const getDoctors = async (req, res) => {
  const doctors = await Doctor.find();

  res.send(doctors);
};

const getDoctorById = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  console.log("dfdsssf");
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  res.send(doctor);
};

const updateDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  // if (doctor.email !== req.body.email) {
  //   const existingDoctor = await Doctor.findOne({
  //     email: req.body.email,
  //   });

  //   if (existingDoctor) {
  //     return res
  //       .status(400)
  //       .json({ error: "Doctor with this email already exists" });
  //   }
  // }

  // Prevent email update by removing it from req.body
  if (req.body.email && req.body.email !== doctor.email) {
    return res.status(400).json({ error: "Email cannot be changed" });
  }

  delete req.body.email; // Ensure email is not updated

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    {
      new: true,
      runValidators: true,
    }
  );

  res.send(updatedDoctor);
};

const deleteDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  await Doctor.findByIdAndDelete(req.params.id);

  res.status(204).send(doctor);
};

const getDoctorsByIds = async (req, res) => {
  try {
    const { doctorIds } = req.body;
    console.log("called with doctorIds:", doctorIds);

    // Validate and convert doctorIds to ObjectIDs
    if (!Array.isArray(doctorIds) || doctorIds.length === 0) {
      return res
        .status(400)
        .json({ error: "doctorIds must be a non-empty array" });
    }

    const objectIds = doctorIds.map((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ObjectID: ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    });

    const doctors = await Doctor.find({ _id: { $in: objectIds } })
      .lean()
      .select("name type specialty workingHours daysOff"); // Adjusted field name to match schema

    // Transform the response data
    const transformedDoctors = doctors.map((doctor) => {
      // Filter workingHours: only include enabled days with startTime and endTime
      const filteredWorkingHours = {};
      for (const day in doctor.workingHours) {
        if (doctor.workingHours[day].enabled) {
          filteredWorkingHours[day] = {
            startTime: doctor.workingHours[day].startTime,
            endTime: doctor.workingHours[day].endTime,
          };
        }
      }

      // Filter daysOff: only include startDate and endDate
      const filteredDaysOff = doctor.daysOff.map((dayOff) => ({
        startDate: dayOff.startDate,
        endDate: dayOff.endDate,
      }));

      return {
        _id: doctor._id,
        name: doctor.name,
        type: doctor.type,
        specialty: doctor.specialty, // Note: schema uses "specialty", not "speciality"
        workingHours: filteredWorkingHours,
        daysOff: filteredDaysOff,
      };
    });

    res.status(200).json({ doctors: transformedDoctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: error.message });
  }
};

const getDoctorPatientsSummary = async (req, res) => {
  const { id } = req.params; // Changed from doctorId to id to match your usage
  const { type } = req.query; // Expecting type=summary

  console.log("doctorId:", id);
  console.log("type:", type);

  try {
    if (type !== "summary") {
      return res
        .status(400)
        .json({ message: "Invalid query type. Use 'type=summary'." });
    }

    // Aggregate patients where the doctorId appears in diagnoseHistory
    const patients = await Patient.find({
      "diagnoseHistory.doctorId": id,
    }).lean();

    console.log("patients:", patients);

    if (!patients || patients.length === 0) {
      return res
        .status(404)
        .json({ message: "No patients found for this doctor." });
    }

    // Process patient data for summary
    const summary = {
      totalPatients: patients.length,
      patients: patients.map((patient) => {
        // Filter diagnoseHistory for this doctor's entries only
        const doctorDiagnoses = patient.diagnoseHistory.filter(
          (diag) => diag.doctorId && diag.doctorId.toString() === id
        );

        // Determine if patient is new or existing based on doctor's diagnoses
        const totalDiagnoseHistoryLength = patient.diagnoseHistory
          ? patient.diagnoseHistory.length
          : 0;

        // Determine if the patient has a nextVisit scheduled
        const hasNextVisit =
          patient.nextVisit && !isNaN(new Date(patient.nextVisit).getTime());

        // Determine if the patient is new or existing based on total diagnoses and nextVisit
        const isNew = totalDiagnoseHistoryLength <= 2 && !hasNextVisit;
        // Extract relevant fields
        return {
          patientId: patient.patientId,
          fullName: patient.fullName,
          category: patient.category, // Disease categories
          totalDiagnoseHistoryLength,
          diagnoseHistory: doctorDiagnoses.map((diag) => ({
            diagnosis: diag.diagnosis,
            uploadedAt: diag.uploadedAt,
            status: diag.status,
            eye: diag.eye,
            confidenceScores: diag.confidenceScores,
            recommend: diag.recommend,
          })),
          patientStatus: patient.patientStatus,
          createdAt: patient.createdAt,
          nextVisit: patient.nextVisit,
          isNew,
        };
      }),
    };

    // Send response
    res.status(200).json({
      message: "Patients summary retrieved successfully",
      data: {
        totalPatients: summary.totalPatients,
        patients: summary.patients,
      },
    });
  } catch (error) {
    console.error("Error fetching doctor patients summary:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching patients summary" });
  }
};

const getDoctorNames = async (req, res) => {
  try {
    const doctors = await Doctor.find({}, "name _id"); // Select only name and _id

    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors: doctors.map((doc) => ({
        _id: doc._id,
        name: doc.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching doctor names:", error);
    res.status(500).json({
      errorCode: "SERVER_ERROR",
      message: "Error fetching doctor names",
      error: error.message,
    });
  }
};

module.exports = {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorsByIds,
  getDoctorPatientsSummary,
  getDoctorNames,
};
