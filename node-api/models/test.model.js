const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    isEnabled: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  }
);

const Test = mongoose.model("Test", TestSchema);

module.exports = Test;
