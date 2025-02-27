const requireSignIn = (req, res, next) => {
  if (!req.currentUser) {
    res.status(401).json({ error: "Not Authorized" });
  }

  next();
};

module.exports = { requireSignIn };
