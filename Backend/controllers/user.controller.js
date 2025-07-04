import User from "../models/user.model.js";
import { createUser } from "../services/user.service.js";
import { validationResult } from "express-validator";


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

export default registerUser;
