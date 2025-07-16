import expressAsyncHandler from "express-async-handler";
import OTP from "../models/otpModel.js";
import User from "../models/userModel.js";
import transporter from "../config/emailConfig.js";
import generateToken from "../config/generateToken.js";
import crypto from "crypto";

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification - ChatTrip",
    html: `
     <div
      style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f9f9f9;
      "
    >
      <div
        style="
          background-color: #38b2ac;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        "
      >
        <h1 style="color: white; margin: 0; font-size: 28px">ChatTrip</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px">
          Email Verification
        </p>
      </div>

      <div
        style="
          background-color: white;
          padding: 40px;
          border-radius: 0 0 10px 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        "
      >
        <h2 style="color: #333; margin-bottom: 20px">Hello ${name}!</h2>
        <p
          style="
            color: #666;
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 30px;
          "
        >
          Welcome to ChatTrip! Please verify your email address by entering the
          verification code below:
        </p>

        <div
          style="
            background-color: #f0f8ff;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
          "
        >
          <p style="color: #333; font-size: 14px; margin-bottom: 10px">
            Your verification code is:
          </p>
          <div
            style="
              font-size: 32px;
              font-weight: bold;
              color: #38b2ac;
              letter-spacing: 5px;
              font-family: monospace;
            "
          >
            ${otp}
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 10px">
            This code will expire in 5 minutes
          </p>
        </div>

        <div
          style="
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          "
        >
          <p style="color: #856404; font-size: 14px; margin: 0">
            <strong>⚠️ Security Note:</strong> Never share this code with
            anyone.
          </p>
        </div>

        <p
          style="
            color: #666;
            font-size: 14px;
            line-height: 1.5;
            margin-top: 30px;
            text-align: center;
          "
        >
          If you didn't create a ChatTrip account, please ignore this email.
        </p>
        <p
          style="
            color: #666;
            font-size: 14px;
            line-height: 1.5;
            margin-top: 30px;
            text-align: center;
          "
        ></p>

        <div
          style="
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
          "
        >
          <p style="color: #999; font-size: 12px">
            This email was sent by ChatTrip. If you have any questions, please
            contact our support team. Email at
            <a
              style="color: #999; text-decoration: none"
              href="mailto:chattrip.management@gmail.com"
              >chattrip.management@gmail.com</a
            >.
          </p>
          <p style="color: #5e5e5e; font-size: 8px">
            Experience seamless, lightning-fast messaging with ChatTrip. Built
            for simplicity, speed, and connection—whether it's one-on-one or a
            group chat, your words arrive the moment you send them. Proudly made
            in BARWALA with ❤️ by
            <b>
              <a
                style="color: #000; text-decoration: none"
                href="https://github.com/parve5h"
                >Parvesh Bansal</a
              ></b
            >.
          </p>

          <p style="color: #626262; font-size: 16px">
            ChatTrip © 2025 - All rights reserved .
          </p>
        </div>
      </div>
    </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send OTP for registration
const sendRegistrationOTP = expressAsyncHandler(async (req, res) => {
  const { name, email, password, avatar } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Delete any existing OTP for this email
  await OTP.deleteMany({ email: email.toLowerCase() });

  // Generate new OTP
  const otp = generateOTP();

  // Create OTP record
  const otpRecord = await OTP.create({
    email: email.toLowerCase(),
    otp,
    userData: {
      name,
      email: email.toLowerCase(),
      password,
      avatar: avatar || "",
    },
  });

  // Send OTP email
  try {
    await sendOTPEmail(email, otp, name);
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      email: email.toLowerCase(),
      expiresIn: 300, // 5 minutes
    });
  } catch (error) {
    // Delete OTP record if email sending fails
    await OTP.findByIdAndDelete(otpRecord._id);
    res.status(500);
    throw new Error("Failed to send OTP email. Please try again.");
  }
});

// Verify OTP and complete registration
const verifyOTPAndRegister = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required");
  }

  // Find OTP record
  const otpRecord = await OTP.findOne({ email: email.toLowerCase() });

  if (!otpRecord) {
    res.status(400);
    throw new Error("OTP expired or invalid. Please request a new OTP.");
  }

  // Check if too many attempts
  if (otpRecord.attempts >= 5) {
    await OTP.findByIdAndDelete(otpRecord._id);
    res.status(400);
    throw new Error("Too many incorrect attempts. Please request a new OTP.");
  }

  // Verify OTP
  if (otpRecord.otp !== otp.toString()) {
    // Increment attempts
    otpRecord.attempts += 1;
    await otpRecord.save();

    res.status(400);
    throw new Error(
      `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`
    );
  }

  // OTP is correct, create user
  const { name, email: userEmail, password, avatar } = otpRecord.userData;

  // Check if user was created in the meantime
  const userExists = await User.findOne({ email: userEmail });
  if (userExists) {
    await OTP.findByIdAndDelete(otpRecord._id);
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user
  const userData = {
    name,
    email: userEmail,
    password,
  };

  // Only add avatar if it's provided and not empty
  if (avatar && avatar.trim() !== "") {
    userData.avatar = avatar;
  }

  const user = await User.create(userData);

  if (user) {
    // Delete OTP record after successful registration
    await OTP.findByIdAndDelete(otpRecord._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create user");
  }
});

// Resend OTP
const resendOTP = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  // Find existing OTP record
  const otpRecord = await OTP.findOne({ email: email.toLowerCase() });

  if (!otpRecord) {
    res.status(400);
    throw new Error(
      "No pending verification found. Please start registration again."
    );
  }

  // Generate new OTP
  const otp = generateOTP();

  // Update OTP record
  otpRecord.otp = otp;
  otpRecord.attempts = 0;
  otpRecord.createdAt = new Date();
  await otpRecord.save();

  // Send new OTP email
  try {
    await sendOTPEmail(email, otp, otpRecord.userData.name);
    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      email: email.toLowerCase(),
      expiresIn: 300,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to resend OTP email. Please try again.");
  }
});

export { sendRegistrationOTP, verifyOTPAndRegister, resendOTP };
