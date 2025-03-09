const generateResetLink = (resetToken) => {
  return `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
};

module.exports = { generateResetLink };
