import React from "react";
import { Box, Text } from "@chakra-ui/react";

const WelcomeChatBox = () => {
  return (
    <>
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        h="100%"
        m={"20px"}
        overflow={"hidden"}
      >
        <Text
          textAlign={"center"}
          fontSize={"4xl"}
          p={"15px"}
          pb={3}
          display={{ base: "none", md: "flex" }}
          justifyContent={"center"}
        >
          Hey Trippers, ready to talk?
        </Text>
        <Text textAlign={"center"} fontSize={"2xl"} p={"15px"} pb={3}>
          Welcome to ChatTrip - Where Conversations Travel in Real Time.
        </Text>
        <Text
          textAlign={"justify"}
          fontSize={"xl"}
          p={"15px"}
          pb={3}
          display={{ base: "none", lg: "flex" }}
        >
          Experience seamless, lightning-fast messaging with ChatTrip. Built for
          simplicity, speed, and connection—whether it's one-on-one or a group
          chat, your words arrive the moment you send them.
        </Text>

        <Text
          fontSize={"large"}
          textAlign={"center"}
          p={"15px"}
          color={"#808080"}
        >
          Click on a chat to start chatting. Use Search feature to Add Folks in
          your "My Chats" list.
        </Text>
        <Text
          fontSize={"large"}
          textAlign={"center"}
          p={"15px"}
          color={"#808080"}
        >
          Proudly made in BARWALA with ❤️ by{" "}
          <a href="http://github.com/parve5h">Parvesh Bansal</a>.
        </Text>
      </Box>
    </>
  );
};

export default WelcomeChatBox;
