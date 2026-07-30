const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name!"],
  },

  email: {
    type: String,
    required: [true, "Please enter your email!"],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Please enter your password!"],
    minlength: 4,
    select: false,
  },

  phoneNumber: {
    type: Number,
  },

  addresses: [
    {
      country: String,
      city: String,
      address1: String,
      address2: String,
      zipCode: Number,
      addressType: String,
    },
  ],

  role: {
    type: String,
    default: "user",
  },

  avatar: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordToken: String,
  resetPasswordTime: Date,
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
