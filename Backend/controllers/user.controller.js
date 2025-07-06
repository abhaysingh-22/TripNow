import User from "../models/user.model.js";
import { createUser } from "../services/user.service.js";
import { validationResult } from "express-validator";
import BlacklistToken from "../models/blacklistToken.model.js";

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await User.hashPassword(password);
  if (!hashedPassword) {
    return res.status(500).json({ error: "Failed to hash password" });
  }

  try {
    const user = await createUser({
      firstName: fullName.firstName,
      lastName: fullName.lastName,
      email,
      password: hashedPassword,
    });

    const token = user.generateAuthToken();
    if (!token) {
      return res.status(500).json({ error: "Failed to generate auth token" });
    }
    return res.status(201).json({ user, token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password"); // this is because password is not selected by default in the user model and this implies that whenever we query the user model(email), bring the password field as well

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = user.generateAuthToken();
  if (!token) {
    return res.status(500).json({ error: "Failed to generate auth token" });
  }

  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  res.status(200).json({ user, token });
};

const getUserProfile = async (req, res, next) => {
  const user = req.user; // The user is set in the auth middleware

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json({
    user: {
      _id: user._id,
      fullName: {
        firstName: user.fullName.firstName,
        lastName: user.fullName.lastName,
      },
      email: user.email,
    },
    message: "User profile retrieved successfully",
  });
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    await BlacklistToken.create({ token });

    return res.status(200).json({ message: "Logged out successfully" });

  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export { registerUser, loginUser, getUserProfile, logoutUser };