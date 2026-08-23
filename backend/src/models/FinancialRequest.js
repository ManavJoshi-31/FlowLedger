import mongoose from "mongoose";

const financialRequestSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0
    },

    category: {
      type: String,
      enum: [
        "PURCHASE",
        "TRAVEL",
        "REIMBURSEMENT",
        "TRAINING",
        "OTHER"
      ],
      required: true
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING",
        "APPROVED",
        "REJECTED",
        "CANCELLED"
      ],
      default: "DRAFT"
    },

    submittedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const FinancialRequest = mongoose.model(
  "FinancialRequest",
  financialRequestSchema
);

export default FinancialRequest;