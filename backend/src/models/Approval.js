import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialRequest",
      required: true
    },

    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    level: {
      type: Number,
      required: true,
      min: 1
    },

    decision: {
      type: String,
      enum: ["APPROVED", "REJECTED", "PENDING"],
      default: "PENDING"
    },

    remarks: {
      type: String,
      trim: true
    },

    decidedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Approval = mongoose.model("Approval", approvalSchema);

export default Approval;