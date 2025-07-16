/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { ChatState } from "../../context/ChatProvider";
import { ArrowLeft, Pencil, Send } from "lucide-react";
import {
  Avatar,
  Text,
  Box,
  Button,
  Spinner,
  Input,
  IconButton,
} from "@chakra-ui/react";
import WelcomeChatBox from "./WelcomeChatBox";
import { getSender, getSenderFull } from "../../config/ChatLogic";
import ProfileDialogBox from "./ProfileDialogBox";
import UpdateGroupChatDialogBox from "./UpdateGroupChatDialogBox";
import axios from "axios";
import { toaster } from "../ui/toaster";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";
import { connectSocket } from "../../context/ChatProvider";
import Lottie from "react-lottie";
import animationData from "../../assets/TypingIndicator.json";

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReceiverProfile, setShowReceiverProfile] = useState(false);
  const [showUpdateGroupChatDialogBox, setShowUpdateGroupChatDialogBox] =
    useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    // Only setup socket if user exists
    if (!user) {
      // Clear messages when user is null (logged out)
      setMessages([]);
      return;
    }

    // Use the optimized socket connection
    socket = connectSocket(
      user,
      () => {
        setSocketConnected(true);
        // Rejoin current chat if exists
        if (selectedChat && selectedChat._id) {
          socket.emit("join chat", selectedChat._id);
        }
      },
      (reason) => {
        console.log('Socket disconnected:', reason);
        setSocketConnected(false);
        setIsTyping(false);
      }
    );
    
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // Handle page navigation/refresh
    const handleBeforeUnload = () => {
      if (selectedChatCompare && selectedChatCompare._id) {
        socket.emit("leave chat", selectedChatCompare._id);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Leave current chat room when component unmounts
      if (selectedChatCompare && selectedChatCompare._id) {
        socket.emit("leave chat", selectedChatCompare._id);
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, selectedChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Clear typing timeout and stop typing immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("stop typing", selectedChat._id);
    setTyping(false);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      setNewMessage("");
      const { data } = await axios.post(
        "/api/message",
        {
          content: newMessage,
          chatId: selectedChat._id,
        },
        config
      );
      socket.emit("new message", data);
      setMessages([...messages, data]);
      
      // Trigger MyChats to reload and show updated chat order
      setFetchAgain(!fetchAgain);
      
      // Force reconnection if socket seems disconnected
      if (!socketConnected) {
        console.log('Socket disconnected, attempting to reconnect...');
        setTimeout(() => {
          if (socket && user) {
            socket.emit('setup', user);
          }
        }, 1000);
      }
    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description: "Failed to send the message",
        type: "error",
        duration: 3000,
        closable: true,
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleSendMessage();
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    const timerLength = 3000;

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, timerLength);

    // Safeguard against message corruption
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description: "Failed to load the messages",
        type: "error",
        duration: 3000,
        closable: true,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    // Leave previous chat room if there was one
    if (selectedChatCompare && selectedChatCompare._id && socket) {
      socket.emit("leave chat", selectedChatCompare._id);
    }

    fetchMessages();
    selectedChatCompare = selectedChat;

    // Clear typing timeout when chat changes
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTyping(false);
    setIsTyping(false);
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    });

    return () => {
      socket.off("message received");
    };
  }, [selectedChatCompare]);

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            pb={3}
            px={2}
            w={"100%"}
            display={"flex"}
            justifyContent={{ base: "space-between" }}
            alignItems={"center"}
          >
            <Button
              variant={"ghost"}
              colorPalette={"teal"}
              padding={0}
              mr={4}
              onClick={() => setSelectedChat("")}
            >
              <ArrowLeft />
            </Button>

            {!selectedChat.isGroupChat ? (
              <>
                <Text
                  fontSize={"2xl"}
                  noOfLines={1}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  maxWidth="100%"
                  marginRight={2}
                  marginLeft={2}
                >
                  {getSender(user, selectedChat.users)}
                </Text>

                <Avatar.Root
                  cursor={"pointer"}
                  onClick={() => setShowReceiverProfile(true)}
                  size={"sm"}
                >
                  <Avatar.Fallback name={getSender(user, selectedChat.users)} />
                  <Avatar.Image
                    src={getSenderFull(user, selectedChat.users).avatar}
                  />
                </Avatar.Root>
              </>
            ) : (
              <>
                <Text
                  fontSize={"2xl"}
                  noOfLines={1}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  maxWidth="100%"
                  marginRight={2}
                  marginLeft={2}
                >
                  {selectedChat.chatName}
                </Text>
                <Button
                  size={"md"}
                  variant={"ghost"}
                  cursor={"pointer"}
                  type="subtle"
                  onClick={() => setShowUpdateGroupChatDialogBox(true)}
                >
                  <Pencil />
                </Button>
              </>
            )}
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            p={3}
            className="chat-messages-container"
            w={"100%"}
            h={"calc(100vh - 160px)"}
            borderRadius={"lg"}
          >
            {loading ? (
              <Spinner
                size={"xl"}
                h={10}
                w={10}
                alignSelf={"center"}
                margin={"auto"}
              />
            ) : (
              <Box
                flex={1}
                overflow={"hidden"}
                height={"calc(100% - 60px)"}
                minHeight={0}
              >
                <ScrollableChat messages={messages} />
              </Box>
            )}
            <Box mt={3}>
              {isTyping ? (
                <div>
                  <Lottie
                    width={50}
                    style={{ margin: 0 }}
                    options={defaultOptions}
                  />
                </div>
              ) : (
                <></>
              )}
              <Box position="relative" display="flex" alignItems="center">
                <Input
                  colorPalette={"teal"}
                  variant={"subtle"}
                  className="message-input"
                  placeholder="Enter a message..."
                  onChange={typingHandler}
                  value={newMessage}
                  onKeyDown={sendMessage}
                  pr="50px"
                />
                <IconButton
                  position="absolute"
                  right="8px"
                  top="50%"
                  transform="translateY(-50%)"
                  size="sm"
                  variant="ghost"
                  colorPalette="teal"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  opacity={newMessage.trim() ? 1 : 0.5}
                  cursor={newMessage.trim() ? "pointer" : "not-allowed"}
                  _hover={{
                    bg: newMessage.trim() ? "teal.100" : "transparent",
                  }}
                >
                  <Send size={16} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <WelcomeChatBox />
      )}
      {showReceiverProfile && (
        <ProfileDialogBox
          user={getSenderFull(user, selectedChat.users)}
          isOpen={showReceiverProfile}
          onClose={() => setShowReceiverProfile(false)}
        />
      )}
      {showUpdateGroupChatDialogBox && (
        <UpdateGroupChatDialogBox
          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}
          fetchMessages={fetchMessages}
          isOpen={showUpdateGroupChatDialogBox}
          onClose={() => setShowUpdateGroupChatDialogBox(false)}
        />
      )}
    </>
  );
};

export default SingleChat;
