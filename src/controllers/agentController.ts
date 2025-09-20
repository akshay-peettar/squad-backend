import { Request, Response } from 'express';
import UserAgent from '../models/userAgentModel';
import AiModel from '../models/aiModel'; // We need this to validate the model exists

// @desc    Create a new UserAgent instance
// @route   POST /api/agents
export const createUserAgent = async (req: Request, res: Response) => {
    // We expect the ID of the base model, a custom name, and the API key
    const { aiModelId, customName, apiKey = '' } = req.body;

    if (!aiModelId || !customName) {
        return res.status(400).json({ message: 'Please provide aiModelId, customName' });
    }

    try {
        // Optional but good practice: Check if the base AiModel actually exists
        const baseModel = await AiModel.findById(aiModelId);
        if (!baseModel) {
            return res.status(404).json({ message: 'Base AI Model not found' });
        }

        const userAgent = new UserAgent({
            aiModel: aiModelId, // Mongoose will cast this string to ObjectId
            customName,
            apiKey,
            owner: req.user._id, // Mongoose will cast this string to ObjectId
        });

        const createdUserAgent = await userAgent.save();
        res.status(201).json(createdUserAgent);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get all UserAgents for the logged-in user
// @route   GET /api/agents
export const getUserAgents = async (req: Request, res: Response) => {
    try {
        // Populate the 'aiModel' field to get details from the AiModel collection
        const agents = await UserAgent.find({ owner: req.user._id }, { apiKey: 0 }).populate('aiModel');
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add a function to get all available base models
export const getBaseAiModels = async (req: Request, res: Response) => {
    try {
        const models = await AiModel.find({ isAvailable: true });
        res.json(models);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
