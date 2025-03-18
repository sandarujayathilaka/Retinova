const User = require("../models/user.model");
const {
  generateToken,
  generateRefreshToken,
  generateResetToken,
} = require("../utils/generate-token");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/send-email");
const { generateResetLink } = require("../utils/generate-link");
const crypto = require("crypto");

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
    token: generateToken(user.id, user.role),
    refreshToken: generateRefreshToken(user.id),
  });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  // Find user with populated profile fields
  const user = await User.findOne({ email }).populate("profile", "name image");

  if (!user || !(await user.matchPassword(password))) {
    throw new Error("Invalid credentials");
  }

  // Structure the user data with profile overrides, excluding unnecessary fields
  const userWithProfileOverride = {
    id: user.id,
    name: user.profile?.name, // Optional chaining in case there's no profile
    image: user.profile?.image,
    ...user.toObject(),
    password: undefined,
    passwordChangedAt: undefined,
    profile: undefined,
    __v: undefined,
    _id: undefined,
  };

  // Send the response
  res.status(200).send({
    user: userWithProfileOverride,
    token: generateToken(user.id, user.role),
    refreshToken: generateRefreshToken(user.id),
  });
};

const refreshToken = async (req, res) => {
  // Verify the refresh token and extract user ID
  const { id } = jwt.verify(req.headers.refresh_token, process.env.JWT_SECRET);

  // Fetch the user and populate the profile fields
  const user = await User.findById(id).populate("profile", "name image");

  // Structure the user data with profile overrides, excluding unnecessary fields
  const userWithProfileOverride = {
    id: user.id,
    name: user.profile?.name, // Optional chaining in case there's no profile
    image: user.profile?.image,
    ...user.toObject(),
    password: undefined,
    passwordChangedAt: undefined,
    profile: undefined,
    __v: undefined,
    _id: undefined,
  };

  // Send the response with the user and generated tokens
  res.status(200).send({
    user: userWithProfileOverride,
    token: generateToken(user.id, user.role),
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

  res.json({ message: "Password reset successful", role: user.role });
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
  // const user = await User.findById(req.params.id).populate("profile");
  const user = await User.findById(req.params.id).populate(
    "profile",
    "name image"
  );

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!user.profile) {
    return res.json(user);
  }
  // Override the profile fields in the user object
  const userWithProfileOverride = {
    id: user.id,
    ...user.toObject(),
    name: user.profile.name,
    image: user.profile.image,
    profile: undefined,
    password: undefined,
    passwordChangedAt: undefined,
    __v: undefined,
    _id: undefined,
  };

  res.json(userWithProfileOverride);
};

const addAdmin = async (req, res) => {
  const { name, email, password, image } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res
      .status(400)
      .json({ error: "User with this email already exists" });
  }

  // Generate a secure random password
  const generatedPassword = crypto.randomBytes(6).toString("hex");

  const admin = new User({
    name,
    email,
    password: password ?? generatedPassword,
    role: "admin",
    image,
  });

  await admin.save();

  // Generate password reset token (valid for 24h)
  const resetToken = generateResetToken(email);
  const resetLink = generateResetLink(resetToken);

  // Send email invite
  await sendEmail(
    email,
    "Reset Your Password",
    "password-reset-new", // MJML template name
    {
      name: name ?? "User",
      resetLink,
    }
  );

  res.status(201).json({ message: "Admin added successfully", admin });
};

const getAdmins = async (req, res) => {
  const admins = await User.find({ role: "admin" });

  res.send(admins);
};

const getAdminById = async (req, res) => {
  const admin = await User.findById(req.params.id);

  if (!admin) {
    return res.status(404).json({ error: "Admin not found" });
  }

  res.send(admin);
};

const updateAdmin = async (req, res) => {
  const admin = await User.findById(req.params.id);

  if (!admin) {
    return res.status(404).json({ error: "Admin not found" });
  }

  const { name, image } = req.body;

  admin.name = name;
  admin.image = image;

  await admin.save();

  res.send(admin);
};

const deleteAdmin = async (req, res) => {
  const admin = await User.findById(req.params.id);

  if (!admin) {
    return res.status(404).json({ error: "Admin not found" });
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(204).send(admin);
};

const toggleUserStatus = async (req, res) => {
  const { id } = req.params; // User ID from URL params
  const { isActive } = req.body; // Boolean value from request body

  // Validate request body
  if (typeof isActive !== "boolean") {
    return res
      .status(400)
      .json({ error: "Invalid isActive value. Must be true or false." });
  }

  console.log("id", id);

  // Find and update the user's status
  const user = await User.findByIdAndUpdate(
    id,
    { isActive },
    { new: true } // Return updated user with selected fields
  );

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json({
    message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    user,
  });
};

const getAllUsers = async (req, res) => {
  const users = await User.find().populate("profile", "name image");

  // Transform users with profile overrides
  const usersWithProfileOverride = users.map((user) => ({
    id: user.id,
    name: user.profile?.name || user.name, // Fallback to user's name if no profile
    image: user.profile?.image,
    ...user.toObject(),
    password: undefined,
    passwordChangedAt: undefined,
    profile: undefined,
    __v: undefined,
    _id: undefined,
  }));

  res.send(usersWithProfileOverride);
};

module.exports = {
  signUp,
  signIn,
  refreshToken,
  resetPassword,
  requestPasswordResetLink,
  getUser,
  addAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  toggleUserStatus,
  getAllUsers,
};
