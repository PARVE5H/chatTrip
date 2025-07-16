import { Box, Text, Button, Avatar } from "@chakra-ui/react";
import React from "react";
import { Search, Plus } from "lucide-react";
import { ChatState } from "../../context/ChatProvider";

const EmptyMyChatsList = () => {
  const { user } = ChatState();
  return (
    <>
      <Box
        height={"80%"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
      >
        <Text
          fontSize={"xl"}
          textAlign={"center"}
          p={"10px"}
          mb={2}
          color={"#808080"}
        >
          Your Chat List Is Empty.
        </Text>
        <Box display={"flex"} flexDir={"row"} gap={0}>
          <Text
            fontSize={"large"}
            textAlign={"center"}
            p={"5px"}
            color={"#808080"}
          >
            Tap on
            <Button
              colorPalette={"teal"}
              borderRadius={"50%"}
              variant="plain"
              size="md"
              padding={0}
              marginLeft={1}
              marginRight={1}
              cursor={"text"}
            >
              <Search />
            </Button>
            to add already registered users in your chat list. Tap on
            <Button
              m={2}
              px={2}
              py={5}
              marginBottom={3}
              colorPalette={"teal"}
              variant={"subtle"}
              cursor={"text"}
              size={"xs"}
            >
              <Box display={"flex"} flexDirection={"column"}>
                <Text>New</Text>
                <Text>Group</Text>
              </Box>
              <Plus />
            </Button>
            to create a new group chat. Tap on{" "}
            <Avatar.Root marginLeft={2} marginRight={2}>
              <Avatar.Fallback name={user.name} />
              <Avatar.Image src={user.avatar} />
            </Avatar.Root>{" "}
            to update your profile.
          </Text>
        </Box>
      </Box>
    </>
  );
};

export default EmptyMyChatsList;
