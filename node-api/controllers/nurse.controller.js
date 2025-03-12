const Nurse = require("../models/nurse.model"); // Corrected model import
const UserService = require("../services/user.service");

const addNurse = async (req, res) => {
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

  // Check if a nurse with this email already exists
  const existingNurse = await Nurse.findOne({ email });

  if (existingNurse) {
    return res
      .status(400)
      .json({ error: "Nurse with this email already exists" });
  }

  const nurse = new Nurse({
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

  await nurse.save();

  await UserService.createUser(email, "nurse", nurse._id, name);

  res.status(201).json({ message: "Nurse added successfully", nurse });
};

const getNurses = async (req, res) => {
  const nurses = await Nurse.find();
  res.send(nurses);
};

const getNurseById = async (req, res) => {
  const nurse = await Nurse.findById(req.params.id);
  if (!nurse) {
    return res.status(404).json({ error: "Nurse not found" });
  }

  res.send(nurse);
};

const updateNurse = async (req, res) => {
  const nurse = await Nurse.findById(req.params.id);

  if (!nurse) {
    return res.status(404).json({ error: "Nurse not found" });
  }

  if (nurse.email !== req.body.email) {
    const existingNurse = await Nurse.findOne({ email: req.body.email });

    if (existingNurse) {
      return res
        .status(400)
        .json({ error: "Nurse with this email already exists" });
    }
  }

  const updatedNurse = await Nurse.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.send(updatedNurse);
};

const deleteNurse = async (req, res) => {
  const nurse = await Nurse.findById(req.params.id);

  if (!nurse) {
    return res.status(404).json({ error: "Nurse not found" });
  }

  await Nurse.findByIdAndDelete(req.params.id);

  res.status(204).send();
};

module.exports = {
  addNurse,
  getNurses,
  getNurseById,
  updateNurse,
  deleteNurse,
};
