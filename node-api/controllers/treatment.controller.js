const Treatment = require("../models/treatment.model");
const Patient = require("../models/patient");

// Create a new treatment record
const createTreatment = async (req, res) => {
  try {
    const { patientId, diagnosisId, optometristId, treatments, tests, description } = req.body;

    const newTreatment = new Treatment({
      patientId,//need to get from patient profile
      diagnosisId,//need to get from diagnosis note
      optometristId,//need to get from current user
      treatments,
      tests,
      description,
    });

    const savedTreatment = await newTreatment.save();
    res.status(201).json(savedTreatment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//..............
// Get all diagnosis records and treatment records for a specific patient
const getDiagnosisWithTreatments = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Find patient by patientId
    const patient = await Patient.findOne({ patientId });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get all diagnosis records for the patient
    const diagnoses = patient.diagnoseHistory;

    // Fetch treatments for each diagnosis
    const diagnosisWithTreatments = await Promise.all(diagnoses.map(async (diagnosis) => {
      // Find treatments for each diagnosis
      const treatments = await Treatment.find({ patientId, diagnosisId: diagnosis._id }).sort({ createdAt: -1 });

      return {
        diagnosis,
        treatments,
      };
    }));

    res.status(200).json(diagnosisWithTreatments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//.............

// Get all treatment records for a specific patient
const getTreatmentsByPatient = async (req, res) => {
  try {
    const treatments = await Treatment.find({ patientId: req.params.patientId })
      .sort({ createdAt: -1 })
      // .populate("optometristId", "name email");

    res.status(200).json(treatments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get treatment records of a specific patient for a specific diagnosis
const getTreatmentsByPatientAndDiagnosis = async (req, res) => {
    try {
      const { patientId, diagnosisId } = req.params;
  
      const treatments = await Treatment.find({ patientId, diagnosisId })
        .sort({ createdAt: -1 })
        // .populate("optometristId", "name email");
  
      res.status(200).json(treatments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// // @desc    Update a treatment record
// const updateTreatment = async (req, res) => {
//   try {
//     const updatedTreatment = await Treatment.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.status(200).json(updatedTreatment);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Delete a treatment record
// const deleteTreatment = async (req, res) => {
//   try {
//     await Treatment.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "Treatment record deleted" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

module.exports = { createTreatment, getDiagnosisWithTreatments, getTreatmentsByPatient, getTreatmentsByPatientAndDiagnosis};
