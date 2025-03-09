const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String },
    role: {
      type: String,
      enum: ["doctor", "nurse", "patient", "admin"],
      required: true,
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "onModel",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

// Add a virtual property that converts role to model name
userSchema.virtual("onModel").get(function () {
  if (this.role === "admin") return undefined;
  return this.role.charAt(0).toUpperCase() + this.role.slice(1);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  done();
});

module.exports = mongoose.model("User", userSchema);
