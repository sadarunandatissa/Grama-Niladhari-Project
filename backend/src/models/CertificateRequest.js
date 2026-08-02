const mongoose = rquire("mongoose");

const CertificateRequestSchema = new mongosse.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
      index: true,
    },
    //Vilage for officer filtering
    certificateType: {
      type: String,
      enum: [
        "residence",
        "family_composition",
        "character",
        "income",
        "scholl_admission",
      ],
      required: true,
    },
    //Purpose of the certificate
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    //Status tracking for the certificate request
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected"],
      default: "pending",
    },
    //GN Officer
    officerNotes: {
      type: String,
      default: "",
    },
    //Dates
    requestDate: {
      type: Date,
      default: Date.now,
    },
    processingDate: {
      type: Date,
    },
    completeDate: {
      type: Date,
    },
    //Digital Certificate File path
    certificateFile: {
      type: String,
      default: null,
    },
    //Tracking ID for reference
    trackingId: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true },
);

//Generate tracking ID before saving the document
CertificateRequestSchema.pre("save", function (next) {
  if (!this.trackingId) {
    const prefix = this.certificateType.substring(0, 3).toUpperCase();
    const random = Math.floor(10000 + Math.random() * 90000);
    this.trackingId = `${prefix}-${Date.now().toString().slice(-6)}-${random}`;
  }
  next();
});
module.exports = mongoose.model("CertificateRequest", CertificateRequestSchema);
