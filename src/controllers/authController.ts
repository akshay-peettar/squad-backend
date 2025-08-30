// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/userModel';
import JWTService from '../services/jwtService'; // 👈 Import our new service class

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req: Request, res: Response) => {
    console.log(req.body);
  const { username, password } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // The password will be automatically hashed by our pre-save hook in the model
    const user = await User.create({
      username,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
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
    const user = await User.findOne({ username });

    // Now we use our custom matchPassword method from the model
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        username: user.username,
        token: JWTService.generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error:any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};