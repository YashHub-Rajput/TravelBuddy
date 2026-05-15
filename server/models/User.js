// File: server/models/User.js
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const VALID_INTERESTS = [
  "hiking","beaches","culture","food","adventure",
  "photography","backpacking","luxury","history","wildlife",
];

const VALID_STYLES = ["budget","mid-range","luxury","backpacker"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    bio:    { type: String, maxlength: [500, "Bio cannot exceed 500 characters"], default: "" },
    avatar: { type: String, default: "" },

    interests: {
      type: [String],
      enum:    { values: VALID_INTERESTS, message: "Invalid interest: {VALUE}" },
      default: [],
      // Filter out blank / invalid values before saving
      set: (arr) => (Array.isArray(arr) ? arr.filter((i) => VALID_INTERESTS.includes(i)) : []),
    },

    travelPreferences: {
      budgetRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 5000 },
      },
      travelStyle: {
        type:    String,
        enum:    { values: VALID_STYLES, message: "Invalid travel style: {VALUE}" },
        default: "mid-range",
      },
    },

    isVerified:   { type: Boolean, default: false },
    rating:       { type: Number,  default: 0, min: 0, max: 5 },
    reviewCount:  { type: Number,  default: 0 },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reportedBy:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Hash password only when it has been modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Ensure travelPreferences sub-document always has valid defaults
userSchema.pre("save", function (next) {
  if (!this.travelPreferences) {
    this.travelPreferences = {};
  }
  if (!this.travelPreferences.budgetRange) {
    this.travelPreferences.budgetRange = { min: 0, max: 5000 };
  }
  if (!this.travelPreferences.travelStyle ||
      !VALID_STYLES.includes(this.travelPreferences.travelStyle)) {
    this.travelPreferences.travelStyle = "mid-range";
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
