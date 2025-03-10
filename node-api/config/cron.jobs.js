const cron = require("node-cron");
const mongoose = require("mongoose");
const Patient = require("../models/patient");

const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const updatePatientAges = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily age update job...");
    try {
      const patients = await Patient.find();
      const bulkOps = patients.map(patient => ({
        updateOne: {
          filter: { _id: patient._id },
          update: { $set: { age: calculateAge(patient.birthDate) } },
        },
      }));
      if (bulkOps.length > 0) {
        await Patient.bulkWrite(bulkOps);
        console.log("Age update completed.");
      } else {
        console.log("No patients to update.");
      }
    } catch (error) {
      console.error("Error during age update:", error);
    }
  });
};

module.exports = updatePatientAges;