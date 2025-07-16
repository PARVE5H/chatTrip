import React, { useState, useEffect } from "react";
import {
  Field,
  Fieldset,
  Button,
  Input,
  CloseButton,
  Dialog,
  Portal,
  Box,
} from "@chakra-ui/react";
import { toaster } from "../ui/toaster";
import UserListItem from "./UserListItem";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "./UserBadgeItem";
import axios from "axios";

const CreateGroupChatDialogBox = ({ isOpen, onClose }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, chats, setChats } = ChatState();

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

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toaster.create({
        title: "Please fill all the fields",
        type: "warning",
        duration: 3000,
        closable: true,
      });
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      setChats([data, ...chats]);
      handleClose();
      toaster.create({
        title: "New Group Chat Created!",
        type: "success",
        duration: 3000,
        closable: true,
      });
    } catch (error) {
      toaster.create({
        title: "Failed to create the group chat",
        description: "Selected members should be greater than one.",
        type: "error",
        duration: 5000,
        closable: true,
      });
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toaster.create({
        title: "User already added",
        type: "warning",
        duration: 3000,
        closable: true,
      });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
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
                <Dialog.Title>Create a Group Chat</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body
                display={"flex"}
                flexDir={"column"}
                alignItems={"center"}
              >
                <Fieldset.Root size="md" maxW="md" colorPalette={"teal"}>
                  <Fieldset.Content>
                    <Field.Root>
                      <Input
                        name="group-name"
                        placeholder="Group name"
                        mb={2}
                        onChange={(e) => {
                          setGroupChatName(e.target.value);
                        }}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Input
                        name="search-user"
                        placeholder="Add members"
                        mb={2}
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                        }}
                      />
                    </Field.Root>
                  </Fieldset.Content>
                </Fieldset.Root>
                <Box w="100%" display={"flex"} flexWrap={"wrap"}>
                  {selectedUsers.map((u) => (
                    <UserBadgeItem
                      key={u._id}
                      user={u}
                      handleFunction={() => handleDelete(u)}
                    />
                  ))}
                </Box>
                {loading ? (
                  <div>Loading.....</div>
                ) : (
                  searchResult
                    ?.slice(0, 10)
                    .map((user) => (
                      <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={() => handleGroup(user)}
                      />
                    ))
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button
                    colorPalette={"teal"}
                    variant="subtle"
                    onClick={handleSubmit}
                  >
                    Create Group
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

export default CreateGroupChatDialogBox;
