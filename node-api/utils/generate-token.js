const jwt = require("jsonwebtoken");

const generateToken = (id, role, profileId) => {
  return jwt.sign({ id, role, profileId }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
};

const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const generateResetToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

module.exports = { generateToken, generateRefreshToken, generateResetToken };
