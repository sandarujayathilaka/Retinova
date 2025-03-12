const User = require("../models/user.model");
const {
  generateToken,
  generateRefreshToken,
  generateResetToken,
} = require("../utils/generate-token");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/send-email");
const { generateResetLink } = require("../utils/generate-link");

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

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token and new password are required" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ error: "Reset link has expired. Request a new one." });
    }
    return res.status(400).json({ error: "Invalid token" });
  }

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    return res.status(400).json({ error: "Invalid token" });
  }

  // Check if the token was issued before password reset
  if (
    user.passwordChangedAt &&
    decoded.iat * 1000 < user.passwordChangedAt.getTime()
  ) {
    return res.status(400).json({
      error: "Token is no longer valid. Please request a new reset link.",
    });
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date(); // Update timestamp
  await user.save();

  res.json({ message: "Password reset successful" });
};

const requestPasswordResetLink = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ error: "Email not found" });
  }

  // Generate a new reset token (valid for 24h)
  const resetToken = generateResetToken(email);
  const resetLink = generateResetLink(resetToken);

  // Send email with the new reset link
  await sendEmail(email, "Password Reset Request", "password-reset-regular", {
    name: user.name || "User",
    resetLink,
  });

  res.json({ message: "Reset link sent successfully" });
};

const getUser = async (req, res) => {
  const user = await User.findById(req.params.id).populate("profile");

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
};

module.exports = {
  signUp,
  signIn,
  refreshToken,
  resetPassword,
  requestPasswordResetLink,
  getUser,
};
