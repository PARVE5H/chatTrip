import React, { useState } from "react";
import {
  Dialog,
  Portal,
  Image,
  Text,
  Button,
  Input,
  Box,
  Field,
  Separator,
} from "@chakra-ui/react";
import { ChatState } from "../../context/ChatProvider";
import { toaster } from "../ui/toaster";
import axios from "axios";
import { Edit, Check, X } from "lucide-react";

const ProfileDialogBox = ({ user, isOpen, onClose }) => {
  const { user: loggedInUser, setUser } = ChatState();
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState(user.avatar);
  const [editMode, setEditMode] = useState(false);
  const [picLoading, setPicLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // Use external state if provided, otherwise use internal state
  const dialogOpen = isOpen !== undefined ? isOpen : openDialog;
  const handleClose = onClose || (() => setOpenDialog(false));

  // File selection handler - doesn't upload immediately
  const handleFileSelect = (file) => {
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file type
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      toaster.create({
        title: "Please select a valid image! (JPEG/PNG)",
        type: "warning",
        duration: 2000,
        closable: true,
      });
      return;
    }

    // Store file and create preview URL
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload file to Cloudinary
  const uploadToCloudinary = async (file) => {
    // Validate file size
    const maxSize = parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 5242880; // 5MB
    if (file.size > maxSize) {
      throw new Error("File too large! Maximum size is 5MB");
    }

    try {
      // Option 1: Use secure backend upload endpoint
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${loggedInUser.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Backend upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      console.error("Backend upload error:", err);

      // Fallback to direct Cloudinary upload if backend fails
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary configuration missing");
      }

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", uploadPreset);
      data.append("cloud_name", cloudName);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();
      if (result.url) {
        return result.url.toString();
      } else {
        throw new Error("Upload failed");
      }
    }
  };

  const handleSave = async () => {
    // Check if any changes were made
    const nameChanged = name !== user.name;
    const avatarChanged = selectedFile !== null;

    if (!nameChanged && !avatarChanged) {
      toaster.create({
        title: "No changes were made",
        description: "Please make some changes before saving.",
        type: "warning",
        duration: 4000,
        closable: true,
      });
      return;
    }

    // Validate name if it was changed
    if (nameChanged && (!name || name.trim() === "")) {
      toaster.create({
        title: "Invalid name",
        description: "Name cannot be empty.",
        type: "error",
        duration: 3000,
        closable: true,
      });
      return;
    }

    try {
      setPicLoading(true);
      let finalAvatar = avatar;

      // Upload file to Cloudinary if a new file was selected
      if (selectedFile) {
        try {
          finalAvatar = await uploadToCloudinary(selectedFile);
          toaster.create({
            title: "Avatar uploaded successfully!",
            type: "success",
            duration: 3000,
            closable: true,
          });
        } catch (uploadError) {
          toaster.create({
            title: "Avatar upload failed!",
            description: "Failed to upload the image. Please try again.",
            type: "error",
            duration: 3000,
            closable: true,
          });
          setPicLoading(false);
          return;
        }
      }

      // Update user profile with new data
      const config = {
        headers: {
          Authorization: `Bearer ${loggedInUser.token}`,
        },
      };

      const updateData = {};
      if (nameChanged) updateData.name = name;
      if (avatarChanged || finalAvatar !== user.avatar)
        updateData.avatar = finalAvatar;

      const { data } = await axios.put("/api/user/profile", updateData, config);

      // Update both context and localStorage
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Reset states
      setSelectedFile(null);
      setPreviewUrl(null);
      setAvatar(data.avatar);
      setPicLoading(false);

      toaster.create({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        type: "success",
        duration: 3000,
        closable: true,
      });
      setEditMode(false);
    } catch (error) {
      setPicLoading(false);
      toaster.create({
        title: "Error Occurred",
        description:
          error.response?.data?.message || "Failed to update profile.",
        type: "error",
        duration: 3000,
        closable: true,
      });
    }
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
              borderRadius={"2xl"}
            >
              <Dialog.Header
                fontSize={"25px"}
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Dialog.Title> {user?.name}'s Profile</Dialog.Title>
                {user._id === loggedInUser._id && (
                  <Button
                    onClick={() => setEditMode(!editMode)}
                    variant="ghost"
                  >
                    <Edit />
                  </Button>
                )}
              </Dialog.Header>
              <Dialog.Body>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    mb={2}
                    src={
                      editMode && previewUrl
                        ? previewUrl
                        : user.avatar ||
                          "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                    }
                    alt={user?.name}
                    width="150px"
                    height="150px"
                    borderRadius="50%"
                    objectFit="cover"
                  />

                  {editMode ? (
                    <Field.Root mb={2}>
                      <Field.HelperText>Change your name:</Field.HelperText>
                      <Input
                        variant="flushed"
                        placeholder="Name can't be empty."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fontSize="lg"
                        textAlign="center"
                      />
                    </Field.Root>
                  ) : (
                    <Text fontSize="xl" fontWeight="bold">
                      {user.name}
                    </Text>
                  )}

                  <Field.Root>
                    <Field.HelperText>Email: </Field.HelperText>
                    <Text alignSelf={"center"} mb={2} fontSize="md">
                      {user?.email}
                    </Text>
                    <Separator variant={"solid"} />
                  </Field.Root>

                  {editMode && (
                    <Field.Root>
                      <Input
                        type="file"
                        p={1.5}
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        disabled={picLoading}
                      />
                      {picLoading && (
                        <Text fontSize="sm" color="gray.500">
                          Uploading avatar...
                        </Text>
                      )}
                      <Field.HelperText>
                        Upload Avatar: Only PNG and JPEG formats are supported.
                      </Field.HelperText>
                    </Field.Root>
                  )}
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                {editMode ? (
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    width="100%"
                    gap={2}
                  >
                    <Button
                      onClick={handleSave}
                      variant={"subtle"}
                      colorPalette="teal"
                      size="sm"
                      loading={picLoading}
                      disabled={picLoading}
                    >
                      <Check /> Save
                    </Button>
                    <Button
                      onClick={() => setEditMode(false)}
                      variant="subtle"
                      size="sm"
                    >
                      <X /> Cancel
                    </Button>
                  </Box>
                ) : (
                  <Dialog.ActionTrigger asChild>
                    <Button variant="subtle" onClick={handleClose}>
                      Close
                    </Button>
                  </Dialog.ActionTrigger>
                )}
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default ProfileDialogBox;
