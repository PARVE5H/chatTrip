import {
  Button,
  Field,
  Fieldset,
  Input,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { toaster } from "../ui/toaster";
import { PasswordInput } from "../ui/password-input";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toaster.create({
        title: "Please Fill all the Fields",
        type: "warning",
        duration: 2000,
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

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toaster.create({
        title: "Login Successfully",
        type: "success",
        duration: 2000,
        closable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (err) {
      toaster.create({
        title: "Login Failed!",
        description: err.response.data.message,
        type: "error",
        duration: 2000,
        closable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack>
      <Fieldset.Root size="lg" maxW="md" colorPalette="teal">
        <Stack>
          <Fieldset.Legend textAlign="center" fontSize="2xl">
            Login
          </Fieldset.Legend>
          <Fieldset.HelperText textAlign="center">
            Please enter your credentials below
          </Fieldset.HelperText>
        </Stack>

        <Fieldset.Content>
          <Field.Root required colorPalette="teal">
            <Field.Label>
              Email
              <Field.RequiredIndicator />
            </Field.Label>
            <Input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field.Root>
          <Field.Root required colorPalette="teal">
            <Field.Label>
              Password
              <Field.RequiredIndicator />
            </Field.Label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field.Root>

          <Field.Root>
            <Button
              bgColor={"#38b2ac"}
              width={"100%"}
              style={{ marginTop: 15 }}
              onClick={submitHandler}
              loading={loading}
              mb={5}
            >
              Login
            </Button>
          </Field.Root>
        </Fieldset.Content>
      </Fieldset.Root>
    </VStack>
  );
};

export default Login;
