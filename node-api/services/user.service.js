const User = require("../models/user.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/send-email");
const { generateResetToken } = require("../utils/generate-token");
const { generateResetLink } = require("../utils/generate-link");

class UserService {
  // Create a user linked to a specific role
  static async createUser(email, role, profileId, name) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    if (!["doctor", "nurse", "patient", "admin"].includes(role)) {
      throw new Error("Invalid role");
    }

    // Generate a secure random password
    const generatedPassword = crypto.randomBytes(6).toString("hex");

    const user = new User({
      email,
      password: generatedPassword,
      name,
      role,
      profileId,
    });

    await user.save();

    // Generate password reset token (valid for 24h)
    const resetToken = generateResetToken(email);
    const resetLink = generateResetLink(resetToken);

    // Send email invite with AWS SES
    await sendEmail(
      email,
      "Reset Your Password",
      "password-reset", // MJML template name
      {
        name: name ?? "User",
        resetLink,
      }
    );

    return user;
  }
}

module.exports = UserService;
