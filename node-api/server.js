const express = require("express");
const path = require('path');
require("dotenv").config();
require("colors");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { errorHandler } = require("./middleware/error-handler");
const { currentUser } = require("./middleware/current-user");
const patientRoutes = require("./routes/patientRoutes")
const updatePatientAges = require("./config/cron.jobs");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const patientNurseRoutes = require("./routes/patient.routes");
const doctorNurseRoutes = require("./routes/doctor.routes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(morgan("dev"));
app.use(cors());

app.use(currentUser);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/patients", patientRoutes);

app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/v2/patients", patientNurseRoutes);
app.use("/api/v2/doctors", doctorNurseRoutes);
app.use(errorHandler);

const port = process.env.PORT || 4000;

connectDB()
  .then(() => {
    updatePatientAges(); // Start cron job after DB connection
    app.listen(port, () => {
      console.log(`🚀 Server started on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
