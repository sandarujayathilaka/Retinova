const express = require("express");
require("dotenv").config();
require("colors");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { errorHandler } = require("./middleware/error-handler");
const { currentUser } = require("./middleware/current-user");
const patientRoutes = require("./routes/patientRoutes")
const userRoutes = require("./routes/user.routes");


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());

app.use(currentUser);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/patients", patientRoutes);

app.use("/api/users", userRoutes);

app.use(errorHandler);

const port = process.env.PORT || 4000;

connectDB();

app.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
});
