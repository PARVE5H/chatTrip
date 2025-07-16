import { Box, CloseButton } from "@chakra-ui/react";
import React from "react";

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      px={2}
      py={0}
      borderRadius={"lg"}
      m={1}
      mb={2}
      fontSize={"14px"}
      backgroundColor={"#38b2ac"}
      cursor={"pointer"}
      onClick={handleFunction}
    >
      {user.name}
      <CloseButton variant={"plain"} size={"xs"} />
    </Box>
  );
};

export default UserBadgeItem;
