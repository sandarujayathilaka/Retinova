const User = require("../models/user.model");
const {
  generateToken,
  generateRefreshToken,
} = require("../utils/generate-token");
const jwt = require("jsonwebtoken");

const signUp = async (req, res) => {
  const { name, username, email, password, role } = req.body;

  // Check if email exists
  const existingEmail = await User.findOne({ email });

  if (existingEmail) {
    throw new Error("Email in use");
  }

  const user = new User({ name, email, password });

  await user.save();

  res.status(201).send({
    user,
    token: generateToken(user.id),
    refreshToken: generateRefreshToken(user.id),
  });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const passwordsMatch = await user.matchPassword(password);

  if (!passwordsMatch) {
    throw new Error("Invalid credentials");
  }

  res.status(200).send({
    user,
    token: generateToken(user.id),
    refreshToken: generateRefreshToken(user.id),
  });
};

const refreshToken = async (req, res) => {
  const { id } = jwt.verify(req.headers.refresh_token, process.env.JWT_SECRET);

  const user = await User.findById(id);

  res.status(200).send({
    user,
    token: generateToken(user.id),
    refreshToken: generateRefreshToken(user.id),
  });
};

module.exports = { signUp, signIn, refreshToken };
