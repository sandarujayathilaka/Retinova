const User = require("../models/user.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/send-email");

class UserService {
  // Create a user linked to a specific role
  static async createUser(email, role, profileId) {
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
      role,
      profileId,
    });

    await user.save();

    // Generate password reset token (valid for 24h)
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Send email invite with AWS SES
    await sendEmail(
      email,
      "Set Your Password",
      `Click the link to set your password: ${resetLink}`
    );

    return user;
  }
}

module.exports = UserService;
