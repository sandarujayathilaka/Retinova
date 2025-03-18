const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ error: "Token expired. Please log in again." });
  }

  res.status(400).send({
    error: { message: err.message || "Something went wrong" },
  });

  next();
};

module.exports = { errorHandler };
