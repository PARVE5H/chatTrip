import expressAsyncHandler from "express-async-handler";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";

// Socket.io instance will be injected
let io;

// Function to inject socket.io instance
export const setSocketInstance = (socketInstance) => {
  io = socketInstance;
};

const accessChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChats = expressAsyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = expressAsyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than two users are required to form a group chat");
  }
  users.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    // Emit socket event for group creation
    if (io) {
      io.emit("group created", fullGroupChat);
    }

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    // Emit socket event for group rename
    if (io) {
      io.emit("group renamed", { chat: updatedChat, renamedBy: req.user });
    }
    
    res.json(updatedChat);
  }
});

const removeFromGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  
  // Get the chat before removing to access all users
  const chatBeforeRemoval = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  
  if (!chatBeforeRemoval) {
    res.status(400);
    throw new Error("Chat Not Found");
    return;
  }
  
  // Get the user being removed
  const removedUser = await User.findById(userId).select("-password");
  
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(400);
    throw new Error("Chat Not Found");
  } else {
    // Check if group is empty (admin was the only user left)
    if (removed.users.length === 0) {
      // Delete the group entirely
      await Chat.findByIdAndDelete(chatId);
      
      // Emit socket event for group deletion
      if (io) {
        io.emit("group deleted", { chat: chatBeforeRemoval, deletedBy: req.user });
      }
      
      res.json({ message: "Group deleted successfully" });
    } else {
      // Emit socket event for member removal
      if (io) {
        io.emit("member removed", { chat: removed, removedUser });
      }
      
      res.json(removed);
    }
  }
});

const addToGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(400);
    throw new Error("Chat Not Found");
  } else {
    // Emit socket event for member addition
    if (io) {
      const addedUser = await User.findById(userId).select("-password");
      io.emit("member added", { chat: added, addedUser });
    }
    
    res.json(added);
  }
});

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};
