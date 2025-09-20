// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/userModel';
import JWTService from '../services/jwtService'; // 👈 Import our new service class

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password, confirmPassword } = req.body;

  // Basic validation
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this username or email already exists' });
    }

    // The password will be automatically hashed by our pre-save hook in the model
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: JWTService.generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Change the route to find by username or email
    const user = await User.findOne({ email :username });

    // Now we use our custom matchPassword method from the model
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: JWTService.generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error:any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};