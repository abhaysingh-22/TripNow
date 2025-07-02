import User from "../models/user.model";
import { createUser } from "../services/user.service";
import { validationResult } from "express-validator";

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password } = req.body;

  const hashedPassword = await User.hashPassword(password);
  if (!hashedPassword) {
    return res.status(500).json({ error: "Failed to hash password" });
  }

  try {
    const user = await createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({ user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
