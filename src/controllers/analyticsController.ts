import { Request, Response } from 'express';
import AnalyticsService from '../services/analyticsService';

export const getTokenUsage = async (req: Request, res: Response) => {
  try {
    // We get the user ID from the protect middleware
    const userId = req.user._id; 
    const data = await AnalyticsService.getTokenUsage(userId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};