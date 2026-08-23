import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: [
        "REQUEST_SUBMITTED",
        "REQUEST_APPROVED",
        "REQUEST_REJECTED",
        "REQUEST_CANCELLED",
        "INFORMATION_REQUESTED"
      ],
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialRequest"
    },

    isRead: {
      type: Boolean,
      default: false
    },

    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;