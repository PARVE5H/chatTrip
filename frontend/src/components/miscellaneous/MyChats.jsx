import React, { useState, useEffect } from "react";
import { ChatState } from "../../context/ChatProvider";
import axios from "axios";
import { toaster } from "../ui/toaster";
import { Avatar, Box, Button, Stack, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import ChatLoading from "./ChatLoading";
import { getSender, getSenderFull } from "../../config/ChatLogic";
import CreateGroupChatDialogBox from "./CreateGroupChatDialogBox";
import EmptyMyChatsList from "./EmptyMyChatsList";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
let socket;

const MyChats = ({ fetchAgain }) => {
  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const [loggedUser, setLoggedUser] = useState();
  const [showCreateGroupChatDialogBox, setShowCreateGroupChatDialogBox] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const fetchChats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("/api/chat", config);
      setChats(data);
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Error Occured",
        description: "Failed to load the chats",
        type: "error",
        duration: 3000,
        closable: true,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setLoggedUser(userInfo);

    // Only fetch chats if user is available
    if (userInfo && user) {
      fetchChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAgain, user]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!user) return;

    socket = io(ENDPOINT);
    socket.emit("setup", user);

    const handleGroupCreated = (groupData) => {
      // Check if current user is part of the group
      const isUserInGroup = groupData.users.some(u => u._id === user._id);
      if (isUserInGroup) {
        fetchChats(); // Refresh chat list
      }
    };

    const handleMemberAdded = (data) => {
      const { chat, addedUser } = data;
      // Check if current user is part of the group or is the added user
      const isUserInGroup = chat.users.some(u => u._id === user._id);
      const isCurrentUserAdded = addedUser._id === user._id;
      
      if (isUserInGroup || isCurrentUserAdded) {
        fetchChats(); // Refresh chat list
      }
    };

    const handleMemberRemoved = (data) => {
      const { chat, removedUser } = data;
      // Check if current user is part of the group or is the removed user
      const isUserInGroup = chat.users.some(u => u._id === user._id);
      const isCurrentUserRemoved = removedUser._id === user._id;
      
      if (isUserInGroup || isCurrentUserRemoved) {
        fetchChats(); // Refresh chat list
      }
    };

    const handleGroupDeleted = (data) => {
      const { chat } = data;
      // Check if current user was part of the deleted group
      const wasUserInGroup = chat.users.some(u => u._id === user._id);
      if (wasUserInGroup) {
        fetchChats(); // Refresh chat list
      }
    };

    const handleGroupRenamed = (data) => {
      const { chat } = data;
      // Check if current user is part of the group
      const isUserInGroup = chat.users.some(u => u._id === user._id);
      if (isUserInGroup) {
        fetchChats(); // Refresh chat list
      }
    };

    // Add socket event listeners
    socket.on("group created", handleGroupCreated);
    socket.on("member added", handleMemberAdded);
    socket.on("member removed", handleMemberRemoved);
    socket.on("group deleted", handleGroupDeleted);
    socket.on("group renamed", handleGroupRenamed);

    // Cleanup on unmount
    return () => {
      socket.off("group created", handleGroupCreated);
      socket.off("member added", handleMemberAdded);
      socket.off("member removed", handleMemberRemoved);
      socket.off("group deleted", handleGroupDeleted);
      socket.off("group renamed", handleGroupRenamed);
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, fetchChats]);

  return (
    <>
      <Box
        display={{
          base: selectedChat ? "none" : "flex",
          sm: selectedChat ? "none" : "flex",
          md: "flex",
        }}
        flexDirection={"column"}
        alignItems={"center"}
        p={3}
        className="theme-box"
        w={{ base: "100%", md: "28%" }}
        borderRadius={"lg"}
        borderWidth={"1px"}
      >
        <Box
          pb={3}
          px={3}
          fontFamily={"Work sans"}
          display={"flex"}
          w={"100%"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Text fontSize={{ base: "24px", md: "16px", lg: "24px" }} mr={1}>
            My Chats
          </Text>
          <Button
            colorPalette={"teal"}
            py={5}
            display={"flex"}
            variant={"subtle"}
            size={"xs"}
            onClick={() => {
              setShowCreateGroupChatDialogBox(true);
            }}
          >
            <Box display={"flex"} flexDirection={"column"}>
              <Text>New</Text>
              <Text>Group</Text>
            </Box>
            <Plus />
          </Button>
        </Box>
        <Box
          display={"flex"}
          flexDirection={"column"}
          p={3}
          w="100%"
          h="100%"
          borderRadius={"lg"}
          overflow={"hidden"}
          className="theme-box"
        >
          {loading ? (
            <ChatLoading />
          ) : chats && chats.length > 0 ? (
            <Stack overflowY={"scroll"}>
              {chats.map((chat) => (
                <Box
                  onClick={() => setSelectedChat(chat)}
                  cursor={"pointer"}
                  className={
                    selectedChat === chat ? "MySelectedChat" : "UnselectedChats"
                  }
                  display={"flex"}
                  alignItems={"center"}
                  gap={4}
                  px={3}
                  py={2}
                  borderRadius={"lg"}
                  key={chat._id}
                >
                  <Avatar.Root shape="rounded" size="lg">
                    <Avatar.Fallback
                      name={
                        !chat.isGroupChat
                          ? loggedUser && chat.users
                            ? getSender(loggedUser, chat.users)
                            : "loading..."
                          : chat.chatName
                      }
                    />
                    <Avatar.Image
                      src={
                        !chat.isGroupChat
                          ? loggedUser && chat?.users
                            ? getSenderFull(loggedUser, chat?.users)?.avatar
                            : null
                          : null
                      }
                    />
                  </Avatar.Root>
                  <Box
                    display={"flex"}
                    flexDirection={"column"}
                    overflow={"hidden"}
                  >
                    <Text
                      fontWeight={"semibold"}
                      noOfLines={1}
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      maxWidth="100%"
                    >
                      {!chat.isGroupChat
                        ? loggedUser && chat.users
                          ? getSender(loggedUser, chat.users)
                          : "Loading..."
                        : chat.chatName}
                    </Text>
                    <Text
                      fontSize="sm"
                      noOfLines={1}
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      maxWidth="100%"
                    >
                      {chat?.latestMessage?.sender?.name === undefined
                        ? ""
                        : chat?.latestMessage?.sender?.name + ": "}
                      {chat?.latestMessage?.content}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <EmptyMyChatsList />
          )}
        </Box>
      </Box>

      {showCreateGroupChatDialogBox && (
        <CreateGroupChatDialogBox
          isOpen={showCreateGroupChatDialogBox}
          onClose={() => setShowCreateGroupChatDialogBox(false)}
        />
      )}
    </>
  );
};

export default MyChats;
