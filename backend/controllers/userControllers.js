import User from "../models/userModel.js";
import expressAsyncHandler from "express-async-handler";
import generateToken from "../config/generateToken.js";

const registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password, avatar } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user data object - only include avatar if it has a value
  const userData = {
    name,
    email,
    password,
  };

  // Only add avatar if it's provided and not empty
  if (avatar && avatar.trim() !== "") {
    userData.avatar = avatar;
  }

  const user = await User.create(userData);

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to Create the User");
  }
});

const authUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  
  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Email or Password");
  }
});

// /api/user?search=parvesh
const allUsers = expressAsyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

// Update user profile (name and avatar only)
const updateProfile = expressAsyncHandler(async (req, res) => {
  const { name, avatar } = req.body;

  // Get user ID from authenticated user
  const userId = req.user._id;

  // Find user by ID
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update only provided fields
  if (name !== undefined && name !== null) {
    if (!name || name.trim() === "") {
      res.status(400);
      throw new Error("Name cannot be empty");
    }
    user.name = name.trim();
  }

  if (avatar !== undefined) {
    user.avatar = avatar;
  }

  // Save updated user (password won't be re-hashed since it's not modified)
  const updatedUser = await user.save();

  // Return updated user data without password
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    avatar: updatedUser.avatar,
    token: generateToken(updatedUser._id),
  });
});

export { registerUser, authUser, allUsers, updateProfile };
