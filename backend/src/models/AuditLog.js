import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    action: {
      type: String,
      required: true,
      trim: true
    },

    entityType: {
      type: String,
      enum: [
        "USER",
        "ORGANIZATION",
        "DEPARTMENT",
        "BUDGET",
        "FINANCIAL_REQUEST",
        "APPROVAL"
      ],
      required: true
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    details: {
      type: mongoose.Schema.Types.Mixed
    },

    ipAddress: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default Auditlog;