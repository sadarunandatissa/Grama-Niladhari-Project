const mongoose = require("mongoose");

const CitizenSchema = new mongoose.Schema(
  {
    family_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: true,
      index: true,
    },
    village_id: {
      type: String,
      ref: "Village",
      required: true,
      index: true,
    },
    // Personal Details
    nic: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    initials: {
      type: String,
      trim: true,
    },
    surname: {
      type: String,
      trim: true,
    },
    first_name: {
      type: String,
      trim: true,
    },
    middle_name: {
      type: String,
      trim: true,
    },
    last_name: {
      type: String,
      trim: true,
    },
    date_of_birth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone_numbers: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0 && v.every((phone) => validatePhone(phone));
        },
      },
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
      },
    },
    occupation: {
      type: String,
      trim: true,
    },
    relationship_to_head: {
      type: String,
      enum: [
        "Self",
        "Spouse",
        "Son",
        "Daughter",
        "Father",
        "Mother",
        "Sibling",
        "Grandparent",
        "Other",
      ],
      default: "Other",
    },
    is_head: {
      type: Boolean,
      default: false,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    verified_at: {
      type: Date,
      default: null,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minlength: 3,
    },
    password_hash: {
      type: String,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Helper function for phone validation
function validatePhone(phone) {
  return /^[0-9]{10}$/.test(phone);
}

module.exports = mongoose.model("Citizen", CitizenSchema);
