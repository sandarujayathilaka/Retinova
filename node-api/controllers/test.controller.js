const Test = require("../models/test.model");

const addTest = async (req, res) => {
  const { name } = req.body;

  const existingTest = await Test.findOne({ name });

  if (existingTest) {
    return res
      .status(400)
      .json({ error: "Test with this name already exists" });
  }

  const test = new Test({
    name,
  });

  await test.save();

  res.status(201).json({ message: "Test added successfully", test });
};

const getTests = async (req, res) => {
  const tests = await Test.find();

  res.send(tests);
};

const getTestById = async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    return res.status(404).json({ error: "Test not found" });
  }

  res.send(test);
};

const updateTest = async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    return res.status(404).json({ error: "Test not found" });
  }

  const updatedTest = await Test.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    {
      new: true,
      runValidators: true,
    }
  );

  res.send(updatedTest);
};

const deleteTest = async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    return res.status(404).json({ error: "Test not found" });
  }

  await Test.findByIdAndDelete(req.params.id);

  res.status(204).send(test);
};

module.exports = {
  addTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
};
