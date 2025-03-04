const errorHandler = (err, req, res, next) => {
  console.error(err);

  res.status(400).send({
    error: { message: err.message || "Something went wrong" },
  });

  next();
};

module.exports = { errorHandler };
