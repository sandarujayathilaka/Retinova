const express = require("express");
const path = require("path");
require("dotenv").config();
require("colors");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { errorHandler } = require("./middleware/error-handler");
const { currentUser } = require("./middleware/current-user");

const patientRoutes = require("./routes/patientRoutes");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const ophthalmicPatientRoutes = require("./routes/ophthalmic.patient.routes");
const utilRoutes = require("./routes/util.routes");
const doctorRoutes = require("./routes/doctor.routes");
const nurseRoutes = require("./routes/nurse.routes");
const updatePatientAges = require("./config/cron.jobs");
const treatmentRoutes = require("./routes/treatment.routes");
// const patientRoutes = require("./routes/patient.routes.temp");
const testRecordssRoutes = require("./routes/test.records.routes");
const testRoutes = require("./routes/test.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(morgan("dev"));
app.use(cors());

app.use(currentUser);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/auth", userRoutes);
app.use("/api/ophthalmic-patients", ophthalmicPatientRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/util", utilRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/patients", testRecordssRoutes);
app.use("/api/nurses", nurseRoutes);
app.use("/api/tests", testRoutes);

app.use(errorHandler);

const port = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server started on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
