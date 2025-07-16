import React from "react";
import { ChatState } from "../../context/ChatProvider.js";
import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat.jsx";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems={"center"}
      flexDirection={"column"}
      p={3}
      w={{ base: "100%", md: "68%" }}
      borderRadius={"lg"}
      borderWidth={"1px"}
      className="theme-box"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
