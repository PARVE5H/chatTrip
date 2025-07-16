import express from 'express';
import { sendRegistrationOTP, verifyOTPAndRegister, resendOTP } from '../controllers/otpController.js';

const router = express.Router();

// Send OTP for registration
router.post('/send-registration-otp', sendRegistrationOTP);

// Verify OTP and complete registration
router.post('/verify-otp', verifyOTPAndRegister);

// Resend OTP
router.post('/resend-otp', resendOTP);

export default router;
