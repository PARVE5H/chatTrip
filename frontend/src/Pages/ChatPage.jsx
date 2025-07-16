import React, { useState } from "react";
import { ChatState } from "../context/ChatProvider";
import { Box } from "@chakra-ui/react";
import Header from "../components/miscellaneous/Header";
import MyChats from "../components/miscellaneous/MyChats";
import ChatBox from "../components/miscellaneous/ChatBox.jsx";

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {user && <Header />}
      <Box
        display="flex"
        justifyContent="space-between"
        width="100%"
        height="91.5vh"
        padding="10px"
        colorPalette={"teal"}
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default ChatPage;
