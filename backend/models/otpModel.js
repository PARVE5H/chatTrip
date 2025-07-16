import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    userData: {
      name: String,
      email: String,
      password: String,
      avatar: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // OTP expires after 5 minutes (300 seconds)
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3, // Maximum 5 attempts
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
otpSchema.index({ email: 1, createdAt: 1 });

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
