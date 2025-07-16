import {
  Button,
  Field,
  Fieldset,
  Input,
  VStack,
  Group,
} from "@chakra-ui/react";
import { Toaster, toaster } from "../ui/toaster";
import { PasswordInput } from "../ui/password-input";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignupWithOTP = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      toaster.create({
        title: "Please fill all the fields",
        type: "warning",
        duration: 3000,
        closable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    if (!isEmailValid(email)) {
      toaster.create({
        title: "Please enter correct email address.",
        type: "warning",
        duration: 3000,
        closable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      toaster.create({
        title: "Password must contain at least six characters.",
        type: "warning",
        duration: 3000,
        closable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      toaster.create({
        title: "Passwords do not match.",
        type: "warning",
        duration: 3000,
        closable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const requestData = {
        name,
        email,
        password,
      };

      await axios.post("/api/otp/send-registration-otp", requestData, config);

      toaster.create({
        title: "OTP sent successfully!",
        description: `Please check your email (${email}) for the verification code`,
        type: "success",
        duration: 3000,
        closable: true,
        position: "bottom",
      });

      setLoading(false);
      setOtpSent(true);
    } catch (err) {
      toaster.create({
        title: "Registration Failed",
        description:
          err.response?.data?.message ||
          "Failed to send OTP. Please try again.",
        type: "error",
        duration: 5000,
        closable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toaster.create({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP code",
        type: "warning",
        duration: 3000,
        closable: true,
        position: "bottom",
      });
      return;
    }

    setVerificationLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/otp/verify-otp",
        { email, otp },
        config
      );

      toaster.create({
        title: "Registration successful!",
        description: "Welcome to ChatTrip! Your account has been created.",
        type: "success",
        duration: 3000,
        closable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setVerificationLoading(false);
      navigate("/chats");
    } catch (err) {
      toaster.create({
        title: "Verification Failed",
        description:
          err.response?.data?.message || "Invalid OTP. Please try again.",
        type: "error",
        duration: 5000,
        closable: true,
        position: "bottom",
      });
      setVerificationLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    setResendLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      await axios.post("/api/otp/resend-otp", { email }, config);

      toaster.create({
        title: "OTP resent successfully!",
        description:
          "A new verification code has been sent to your email. Kindly check your spam folder if the email is not in your inbox.",
        type: "success",
        duration: 6000,
        closable: true,
        position: "bottom",
      });

      setResendLoading(false);
    } catch (err) {
      toaster.create({
        title: "Resend Failed",
        description:
          err.response?.data?.message ||
          "Failed to resend OTP. Please try again.",
        type: "error",
        duration: 5000,
        closable: true,
        position: "bottom",
      });
      setResendLoading(false);
    }
  };

  return (
    <VStack spacing="4" width="100%">
      <Fieldset.Root size="md" maxW="md">
        <Fieldset.Legend textAlign="center" fontSize="2xl">
          Create Account
        </Fieldset.Legend>
        <Fieldset.HelperText textAlign="center">
          Please fill in all the details to create an account
        </Fieldset.HelperText>
        <Fieldset.Content>
          <Field.Root colorPalette="teal" required>
            <Field.Label>
              Name
              <Field.RequiredIndicator />
            </Field.Label>
            <Input
              colorPalette="teal"
              type="text"
              value={name}
              placeholder="Enter your full name"
              onChange={(e) => setName(e.target.value)}
            />
          </Field.Root>

          <Field.Root required colorPalette="teal">
            <Field.Label>
              Email
              <Field.RequiredIndicator />
            </Field.Label>
            <Group attached w={"full"} maxW={"100%"}>
              <Input
                flex={1}
                type="email"
                value={email}
                placeholder="Enter a valid email address"
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
              />
              <Button
                colorPalette="teal"
                bgColor="#38b2ac"
                onClick={submitHandler}
                loading={loading}
                disabled={!isEmailValid(email) || otpSent}
                display={"flex"}
                flexDirection={"column"}
              >
                Verify Email
              </Button>
            </Group>
            <Field.HelperText color={"red"}>
              {email.length > 5 &&
                !isEmailValid(email) &&
                "Please enter a valid email."}
            </Field.HelperText>
          </Field.Root>

          {/* New Verify OTP mechanism */}
          {otpSent && (
            <>
              <Field.Root id="otp" required colorPalette="teal">
                <Field.Label>
                  Enter Verification Code
                  <Field.RequiredIndicator />
                </Field.Label>
                <Group attached w={"full"} maxW={"100%"}>
                  <Input
                    flex={1}
                    type="text"
                    placeholder="Enter 6-digit code"
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    value={otp}
                    maxLength="6"
                    textAlign="center"
                    fontSize={{ base: "lg", md: "xl" }}
                    letterSpacing={{ base: "none", sm: "0.2em" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") verifyOTP();
                    }}
                    bg={{ base: "gray.50", _dark: "gray.700" }}
                    borderColor="teal.500"
                    borderWidth="2px"
                    color={{ base: "gray.900", _dark: "gray.100" }}
                    _placeholder={{
                      color: { base: "gray.500", _dark: "gray.400" },
                    }}
                    fontFamily="monospace"
                  />
                  <Button
                    colorPalette="teal"
                    display={"flex"}
                    onClick={resendOTP}
                    loading={resendLoading}
                  >
                    Resend OTP
                  </Button>
                </Group>
                <Field.HelperText>Code expires in 5 minutes</Field.HelperText>
              </Field.Root>

              <Button
                colorPalette="teal"
                bgColor="#38b2ac"
                onClick={verifyOTP}
                loading={verificationLoading}
                disabled={!otp || otp.length !== 6}
              >
                Verify & Register
              </Button>

              <Button
                variant="surface"
                colorPalette={"red"}
                size="sm"
                mb={4}
                onClick={() => {
                  setName("");
                  setEmail("");
                  setLoading(false);
                  setOtpSent(false);
                  setOtp("");
                }}
              >
                Cancel Registration
              </Button>
            </>
          )}

          {!otpSent && (
            <>
              <Field.Root id="password" required colorPalette="teal">
                <Field.Label>
                  Password
                  <Field.RequiredIndicator />
                </Field.Label>
                <PasswordInput
                  placeholder={"Password must contain at least 6 characters"}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field.Root>
              <Field.Root id="confirm-password" required colorPalette="teal">
                <Field.Label>
                  Confirm Password
                  <Field.RequiredIndicator />
                </Field.Label>
                <PasswordInput
                  placeholder={"Re-enter your password"}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field.Root>
              <Button colorPalette="teal" bgColor="#38b2ac" disabled={!otpSent}>
                Kindly Verify Email to Register
              </Button>
            </>
          )}
        </Fieldset.Content>
      </Fieldset.Root>
      <Toaster />
    </VStack>
  );
};

export default SignupWithOTP;
