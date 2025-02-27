const jwt = require("jsonwebtoken");

const currentUser = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      const token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Set req.currentUser so that it can be accessed in any route that is protected
      req.currentUser = decoded;
    } catch (error) {}
  }

  next();
};

module.exports = { currentUser };
