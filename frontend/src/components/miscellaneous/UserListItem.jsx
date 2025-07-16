import React from "react";
import { Avatar, Box, Text } from "@chakra-ui/react";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      colorPalette={"teal"}
      onClick={handleFunction}
      cursor="pointer"
      className="theme-box"
      w="100%"
      display={"flex"}
      alignItems={"center"}
      px={3}
      py={2}
      mb={2}
      borderRadius={"lg"}
      position="relative"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      <Avatar.Root size="sm" mr={2} style={{ pointerEvents: "none" }}>
        <Avatar.Image src={user?.avatar} style={{ pointerEvents: "none" }} />
        <Avatar.Fallback name={user?.name} style={{ pointerEvents: "none" }} />
      </Avatar.Root>
      <Box flex={1} style={{ pointerEvents: "none" }}>
        <Text style={{ pointerEvents: "none" }}>{user.name}</Text>
        <Text fontSize={"xs"} style={{ pointerEvents: "none" }}>
          <b>Email: </b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
