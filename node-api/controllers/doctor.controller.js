const Doctor = require("../models/doctor.model");
const UserService = require("../services/user.service");
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

  await UserService.createUser(email, "doctor", doctor._id);

  res.status(201).json({ message: "Doctor added successfully", doctor });
};

const getDoctors = async (req, res) => {
  const doctors = await Doctor.find();

  res.send(doctors);
};

const getDoctorById = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

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

  if (doctor.email !== req.body.email) {
    const existingDoctor = await Doctor.findOne({
      email: req.body.email,
    });

    if (existingDoctor) {
      return res
        .status(400)
        .json({ error: "Doctor with this email already exists" });
    }
  }

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

module.exports = {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
