const mongoose = require("mongoose");

const treatmentSchema =  mongoose.Schema(
  {
    patientId: { 
        type: String, 
        ref: "Patient", 
        required: true 
    },
    
    diagnosisId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },

    optometristId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Optometrist", 
        required: true 
    },

    treatments: [
      {
        name: { 
            type: String, 
            required: true 
        },

        status: { 
            type: String, 
            enum: ["ongoing", "completed", "pending"],             
            required: true 
        },
      }
    ],

    tests: [
      {
        name: { 
            type: String, 
            required: true 
        },

        value: { 
            type: String, 
            required: true 
        },

        attachment: { 
            type: String 
        }, 
      }
    ],

    description: { 
        type: String
    },
  },

  { timestamps: true }
  
);

module.exports = mongoose.model("Treatment", treatmentSchema);
