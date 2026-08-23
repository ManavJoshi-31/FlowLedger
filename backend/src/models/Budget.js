import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
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

    totalAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0
    },

    usedAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0,
      min: 0
    },

    period: {
      startDate: {
        type: Date,
        required: true
      },

      endDate: {
        type: Date,
        required: true
      }
    },

    status: {
      type: String,
      enum: ["ACTIVE", "CLOSED"],
      default: "ACTIVE"
    }
  },
  {
    timestamps: true
  }
);

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;