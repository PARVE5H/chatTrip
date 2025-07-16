import { useState, useEffect } from "react";
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Input,
  LoaderOverlay,
  Portal,
  Spinner,
} from "@chakra-ui/react";
import { toaster } from "../ui/toaster";
import axios from "axios";
import ChatLoading from "./ChatLoading.jsx";
import UserListItem from "./UserListItem.jsx";
import { ChatState } from "../../context/ChatProvider.js";

const SideDrawer = ({ user, isOpen, onClose }) => {
  const [openSideDrawer, setOpenSideDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const { setSelectedChat, chats, setChats } = ChatState();

  // Use external state if provided, otherwise use internal state
  const drawerOpen = isOpen !== undefined ? isOpen : openSideDrawer;
  const handleClose = onClose || (() => setOpenSideDrawer(false));

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search.trim()) {
        handleSearch("auto");
      } else {
        setSearchResult([]);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [search, user]);

  const handleSearch = async (triggeredBy) => {
    if (triggeredBy === "onClick" && !search) {
      toaster.create({
        title: "Invalid Input",
        description: "Please enter something in search",
        type: "warning",
        duration: 3000,
        closable: true,
        placement: "top-left",
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: "Failed to load the search results",
        type: "error",
        duration: 3000,
        closable: true,
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      setLoadingChat(false);
      handleClose();
    } catch (error) {
      toaster.create({
        title: "Error fetching the chat",
        description: error.message,
        type: "error",
        duration: 3000,
        closable: true,
      });
    }
  };

  return (
    <>
      <Drawer.Root
        open={drawerOpen}
        onOpenChange={({ open }) => (open ? null : handleClose())}
        placement="top"
        size={"xs"}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content margin={0.25} borderBottomRadius={"14px"}>
              <Drawer.Header>
                <Drawer.Title fontSize={"2xl"} color={"#38b2ac"}>
                  Search User
                </Drawer.Title>
              </Drawer.Header>
              <LoaderOverlay />

              <Drawer.Body>
                <Box display={"flex"} pb={2} colorPalette={"teal"}>
                  <Input
                    type="text"
                    placeholder="Search by name or email"
                    mr={2}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                  />
                  <Button
                    variant={"surface"}
                    size={"md"}
                    onClick={() => {
                      handleSearch("onClick");
                    }}
                  >
                    Go
                  </Button>
                </Box>

                {loading ? (
                  <ChatLoading />
                ) : (
                  searchResult?.map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => accessChat(user._id)}
                    />
                  ))
                )}

                {loadingChat && <Spinner alignSelf={"center"} />}
              </Drawer.Body>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
};

export default SideDrawer;
