import ScrollToBottom from "react-scroll-to-bottom";
import { ChatState } from "../../context/ChatProvider.js";
import { Avatar } from "@chakra-ui/react";
// import { Tooltip } from '../ui/tooltip.jsx';
import { Tooltip } from "@chakra-ui/react";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  const isMyMessage = (message) => message.sender._id === user._id;
  const shouldShowAvatar = (message, index) => {
    // Show avatar if it's the last message from this sender OR if it's from another user
    const isLastFromSender =
      index === messages.length - 1 ||
      messages[index + 1].sender._id !== message.sender._id;
    return !isMyMessage(message) && isLastFromSender;
  };

  return (
    <ScrollToBottom className="message-container">
      {messages &&
        messages.map((message, index) => {
          const isFromMe = isMyMessage(message);
          const showAvatar = shouldShowAvatar(message, index);
          const isConsecutive =
            index > 0 && messages[index - 1].sender._id === message.sender._id;

          return (
            <div
              key={message._id}
              style={{
                display: "flex",
                marginBottom: "3px",
                marginTop: isConsecutive ? "2px" : "10px",
                justifyContent: isFromMe ? "flex-end" : "flex-start",
                alignItems: "flex-end",
              }}
            >
              {/* Avatar for received messages */}
              {showAvatar ? (
                <Tooltip.Root>
                  <Tooltip.Trigger>
                    <Avatar.Root size="xs" mr={2} cursor="pointer">
                      <Avatar.Image
                        src={message.sender.avatar}
                        name={message.sender.name}
                      />
                      <Avatar.Fallback name={message.sender.name}>
                        {message.sender.name?.charAt(0)}
                      </Avatar.Fallback>
                    </Avatar.Root>
                  </Tooltip.Trigger>
                  <Tooltip.Positioner>
                    <Tooltip.Content>
                      {message.sender.name}
                      <Tooltip.Arrow />
                    </Tooltip.Content>
                  </Tooltip.Positioner>
                </Tooltip.Root>
              ) : (
                !isFromMe && (
                  <div style={{ width: "32px", marginRight: "8px" }} />
                )
              )}

              {/* Message Content */}
              <span
                className={isFromMe ? "my-message" : "other-message"}
                style={{
                  borderRadius: "20px",
                  padding: "8px 15px",
                  maxWidth: "75%",
                  wordWrap: "break-word",
                  display: "inline-block",
                }}
              >
                {message.content}
              </span>
            </div>
          );
        })}
    </ScrollToBottom>
  );
};

export default ScrollableChat;
