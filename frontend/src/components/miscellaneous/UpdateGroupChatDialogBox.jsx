import { useState, useEffect } from "react";
import {
  Field,
  Fieldset,
  Button,
  Input,
  CloseButton,
  Dialog,
  Portal,
  Box,
  Spinner,
} from "@chakra-ui/react";
import { toaster } from "../ui/toaster";
import UserListItem from "./UserListItem";
import UserBadgeItem from "./UserBadgeItem";
import { ChatState } from "../../context/ChatProvider";
import axios from "axios";

const UpdateGroupChatDialogBox = ({
  fetchAgain,
  setFetchAgain,
  fetchMessages,
  isOpen,
  onClose,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const { user, selectedChat, setSelectedChat } = ChatState();

  // Use external state if provided, otherwise use internal state
  const dialogOpen = isOpen !== undefined ? isOpen : openDialog;
  const handleClose = onClose || (() => setOpenDialog(false));

  // Debounced search effect - automatically searches when search state changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search.trim()) {
        handleSearch();
      } else {
        // Clear search results when search is empty (handles backspace to empty state)
        setSearchResult([]);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [search, user]);

  const handleSearch = async () => {
    if (!search.trim()) {
      setSearchResult([]);
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
      setLoading(false);
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toaster.create({
        title: "User is already in the group",
        type: "info",
        duration: 3000,
        closable: true,
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toaster.create({
        title: "Only admin can add someone",
        type: "error",
        duration: 3000,
        closable: true,
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
      const { data } = await axios.put(
        "/api/chat/groupadd",
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: error.response.data.message,
        type: "error",
        duration: 3000,
        closable: true,
      });
      setLoading(false);
    }
  };

  const handleRemove = async (user1) => {
    // Check if admin is trying to leave when there are other users in the group
    if (
      selectedChat.users.length > 1 &&
      selectedChat.groupAdmin._id === user1._id &&
      user1._id === user._id
    ) {
      toaster.create({
        title: "Admin can't leave the group",
        type: "error",
        duration: 3000,
        closable: true,
      });
      return;
    }

    // Check if only admin is trying to remove someone else (not themselves)
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toaster.create({
        title: "Only admin can remove someone",
        type: "error",
        duration: 3000,
        closable: true,
      });
      return;
    }

    // Special case: Admin is the only user left and wants to leave (delete group)
    if (
      selectedChat.users.length === 1 &&
      selectedChat.groupAdmin._id === user._id &&
      user1._id === user._id
    ) {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        await axios.put(
          "/api/chat/groupremove",
          {
            chatId: selectedChat._id,
            userId: user1._id,
          },
          config
        );

        // Clear selectedChat to avoid errors and close dialog
        setSelectedChat(null);
        setFetchAgain(!fetchAgain);
        handleClose();
        setLoading(false);

        toaster.create({
          title: "Group Deleted Successfully!",
          type: "success",
          duration: 3000,
          closable: true,
        });

        return; // Exit function early
      } catch (error) {
        toaster.create({
          title: "Error Occurred!",
          description:
            error.response?.data?.message || "Failed to delete group",
          type: "error",
          duration: 3000,
          closable: true,
        });
        setLoading(false);
        return;
      }
    }

    // Normal removal process (admin removing other users or user leaving)
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/groupremove",
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
      toaster.create({
        title: "Member removed from the group",
        type: "success",
        duration: 3000,
        closable: true,
      });

      // If user is leaving, clear selectedChat, otherwise update with new data
      if (user1._id === user._id) {
        setSelectedChat(null);
        handleClose(); // Close dialog when user leaves
      } else {
        setSelectedChat(data);
      }

      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Failed to remove user",
        type: "error",
        duration: 3000,
        closable: true,
      });
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    if (selectedChat.groupAdmin._id !== user._id) {
      toaster.create({
        title: "Only admin can change group name",
        type: "error",
        duration: 3000,
        closable: true,
      });
      return;
    }

    try {
      setRenameLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chat/renamegroup",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: error.response.data.message,
        type: "error",
        duration: 3000,
        closable: true,
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  };

  return (
    <>
      <Dialog.Root
        open={dialogOpen}
        onOpenChange={({ open }) => (open ? null : handleClose())}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              marginInline={6}
              marginTop={150}
              display={"flex"}
              justifyContent={"center"}
              padding={2}
            >
              <Dialog.Header
                fontSize={"25px"}
                display={"flex"}
                justifyContent={"center"}
              >
                <Dialog.Title>{selectedChat.chatName}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body
                display={"flex"}
                flexDir={"column"}
                alignItems={"center"}
              >
                <Box w="100%" display={"flex"} flexWrap={"wrap"} pb={3}>
                  {selectedChat.users.map((u) => (
                    <UserBadgeItem
                      key={u._id}
                      user={u}
                      handleFunction={() => handleRemove(u)}
                    />
                  ))}
                </Box>

                <Fieldset.Root
                  display={"flex"}
                  size="md"
                  maxW="md"
                  colorPalette={"teal"}
                >
                  <Fieldset.Content>
                    <Field.Root>
                      <Box display={"flex"} width={"100%"}>
                        <Input
                          name="group-name"
                          placeholder="Change Group Name"
                          mb={2}
                          mr={2}
                          width={"70%"}
                          onChange={(e) => {
                            setGroupChatName(e.target.value);
                          }}
                        />
                        <Button
                          variant={"surface"}
                          colorPalette={"teal"}
                          ml={1}
                          width={"25%"}
                          loading={renameLoading}
                          onClick={handleRename}
                        >
                          Update
                        </Button>
                      </Box>
                    </Field.Root>
                    <Field.Root>
                      <Input
                        name="search-user"
                        placeholder="Add member(s) to group"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                        }}
                      />
                      {loading ? (
                        <Spinner size={"lg"} alignSelf={"center"} />
                      ) : (
                        searchResult
                          ?.slice(0, 10)
                          .map((user) => (
                            <UserListItem
                              key={user._id}
                              user={user}
                              handleFunction={() => handleAddUser(user)}
                            />
                          ))
                      )}
                    </Field.Root>
                  </Fieldset.Content>
                </Fieldset.Root>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button
                    colorPalette={"red"}
                    variant="subtle"
                    onClick={() => {
                      handleRemove(user);
                    }}
                  >
                    Leave Group
                  </Button>
                </Dialog.ActionTrigger>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" variant={"ghost"} />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default UpdateGroupChatDialogBox;
