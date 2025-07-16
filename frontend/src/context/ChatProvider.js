import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

// Socket configuration for production
const ENDPOINT = process.env.NODE_ENV === "production" 
  ? window.location.origin // Use same origin for static binding
  : "http://localhost:5000";

// Socket instance
let socket;

// Socket connection utility with reconnection logic
const connectSocket = (user, onConnect, onDisconnect) => {
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(ENDPOINT, {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    maxReconnectionAttempts: 5,
    autoConnect: true,
    forceNew: true
  });
  
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    if (user) {
      socket.emit('setup', user);
    }
    if (onConnect) onConnect();
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (onDisconnect) onDisconnect(reason);
  });
  
  socket.on('reconnect', (attemptNumber) => {
    console.log('Socket reconnected after', attemptNumber, 'attempts');
    if (user) {
      socket.emit('setup', user);
    }
  });
  
  socket.on('reconnect_error', (error) => {
    console.log('Socket reconnection error:', error);
  });
  
  return socket;
};

// Export socket utilities
export { connectSocket, socket };

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);
  const navigate = useNavigate();
  
  // Function to clear all chat-related state
  const clearChatState = () => {
    setSelectedChat(null);
    setChats([]);
    setNotification([]);
    setUser(null);
  };
  
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);
  
  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
        clearChatState,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
export const ChatState = () => {
  return useContext(ChatContext);
};
export default ChatProvider;
