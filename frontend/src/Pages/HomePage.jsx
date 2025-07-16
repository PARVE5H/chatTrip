import React, { useEffect } from "react";
import {
  Box,
  Container,
  Text,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@chakra-ui/react";
import logo from "../assets/logo.png";

import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/SignupWithOTP";
import { useNavigate } from "react-router-dom";
import { ColorModeButton } from "../components/ui/color-mode";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) {
      navigate("/chats");
    }
  }, [navigate]);

  return (
    <Container maxWidth="xl" centerContent>
      <Box
        position="fixed"
        top="16px"
        right="16px"
        zIndex={9999}
        borderRadius={"lg"}
        className="theme-box"
      >
        <ColorModeButton />
      </Box>

      <Box
        display="flex"
        cursor={"pointer"}
        justifyContent="center"
        p={2}
        m={"75px 0 15px 0"}
        w={"100%"}
        borderRadius={"lg"}
        borderWidth={"none"}
        className="theme-box"
      >
        <span className="hover-style">
          <span
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "8px",
              paddingLeft: "4px",
              paddingRight: "8px",
            }}
          >
            <img src={logo} height={"18px"} width={"52px"} alt="logo" />
            <Text
              fontSize={"3xl"}
              fontFamily="Work sans"
              color={"#38b2ac"}
              fontWeight={"semibold"}
            >
              ChatTrip
            </Text>
          </span>
        </span>
      </Box>
      <Box
        w="100%"
        p={4}
        borderRadius={"lg"}
        borderWidth={"none"}
        className="theme-box"
      >
        <Tabs.Root
          defaultValue="login"
          variant="subtle"
          fitted="true"
          colorPalette={"teal"}
          justify="center"
          activationMode="automatic"
        >
          <TabsList>
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Login />
          </TabsContent>
          <TabsContent value="signup">
            <Signup />
          </TabsContent>
        </Tabs.Root>
      </Box>
    </Container>
  );
};

export default HomePage;
