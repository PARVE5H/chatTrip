import { Box, Button, Text, Portal, Menu, Badge } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { ColorModeButton } from "../ui/color-mode.jsx";
import logo from "../../assets/logo.png";
import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { ChatState } from "../../context/ChatProvider.js";
import { Link } from "react-router-dom";
import ProfileDialogBox from "./ProfileDialogBox.jsx";
import { useNavigate } from "react-router-dom";
import SideDrawer from "./SideDrawer.jsx";
import { getSender } from "../../config/ChatLogic.js";

const Header = () => {
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [showProfileDialogBox, setShowProfileDialogBox] = useState(false);
  const {
    user,
    setSelectedChat,
    notification,
    setNotification,
    clearChatState,
  } = ChatState();
  const navigate = useNavigate();

  const logoutHandler = () => {
    // Clear all chat-related state before logging out
    clearChatState();
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <>
      <Box
        className="theme-box"
        display="flex"
        justifyContent={{ base: "space-around", sm: "space-between" }}
        alignItems="center"
        w="100%"
        p={{ sm: "5px 10px 5px 20px", md: "5px 15px 5px 25px " }}
        border="none"
        colorPalette={"teal"}
      >
        <Link to="/chats">
          <div className="hover-style">
            <div
              style={{
                display: "flex",
                gap: "4px",
                cursor: "pointer",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "6px",
                paddingLeft: "4px",
                paddingRight: "8px",
              }}
            >
              <img src={logo} height={"10px"} width={"42px"} alt="logo" />
              <Text
                style={{ fontSize: "22px" }}
                fontFamily="Work sans"
                color={"#38b2ac"}
              >
                <b>ChatTrip </b>
              </Text>
            </div>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            p={0}
            m={0}
            borderRadius={"4px"}
            variant="ghost"
            size="md"
            display={"flex"}
            justifyContent={"center"}
            gap={"0"}
            padding={2}
            margin={1}
            onClick={() => {
              setShowSideDrawer(true);
            }}
          >
            <Search />
          </Button>
          <Box p={0}>
            <ColorModeButton />
          </Box>
          <Menu.Root colorPalette="teal">
            <Menu.Trigger>
              <Button variant="ghost" size="md" position="relative">
                <Bell />
                {notification.length > 0 && (
                  <Badge
                    position="absolute"
                    top="-0px"
                    right="8px"
                    colorScheme="red"
                    borderRadius="full"
                    minW="20px"
                    h="20px"
                    fontSize="16px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {notification.length}
                  </Badge>
                )}
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content p={2}>
                  {!notification.length && "No New Messages"}
                  {notification.map((notify) => (
                    <Menu.Item
                      key={notify._id}
                      onClick={() => {
                        setSelectedChat(notify.chat);
                        setNotification(
                          notification.filter((n) => n !== notify)
                        );
                      }}
                    >
                      {notify.chat.isGroupChat
                        ? `New Message(s) in ${notify.chat.chatName}`
                        : `New Message(s) from ${getSender(
                            user,
                            notify.chat.users
                          )}`}
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>

          <Menu.Root>
            <Menu.Trigger>
              <Avatar.Root cursor={"pointer"} padding={0} size="sm" m={1}>
                <Avatar.Image src={user?.avatar} />
                <Avatar.Fallback name={user?.name?.charAt(0)} />
              </Avatar.Root>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item
                    value="my-profile"
                    onClick={() => {
                      setShowProfileDialogBox(true);
                    }}
                  >
                    My Profile
                  </Menu.Item>
                  <Menu.Item value="log-out" onClick={logoutHandler}>
                    Log Out
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </div>
      </Box>

      {/* ProfileDialogBox and SideDrawer rendered outside of Box */}
      {showProfileDialogBox && (
        <ProfileDialogBox
          user={user}
          isOpen={showProfileDialogBox}
          onClose={() => setShowProfileDialogBox(false)}
        />
      )}
      {showSideDrawer && (
        <SideDrawer
          user={user}
          isOpen={showSideDrawer}
          onClose={() => setShowSideDrawer(false)}
        />
      )}
    </>
  );
};

export default Header;
