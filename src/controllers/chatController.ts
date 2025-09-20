import { Request, Response } from 'express';
import Chat from '../models/chatModel';
import Message from '../models/messageModel';

// @desc    Create a new chat
// @route   POST /api/chats
export const createChat = async (req: Request, res: Response) => {
    // const { title } = req.body; // We remove this line
    const userId = req.user._id;

    try {
        const newChat = new Chat({
            // The 'title' will now correctly use the default "New Chat" from the model
            user: userId,
        });

        const savedChat = await newChat.save();
        res.status(201).json(savedChat);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get messages for a specific chat
// @route   GET /api/chats/:chatId/messages
export const getMessagesForChat = async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const userId = req.user._id;

    try {
        // Ensure the chat belongs to the user
        const chat = await Chat.findOne({ _id: chatId, user: userId });
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found or access denied' });
        }

        const messages = await Message.find({ chat: chatId })
            .sort({ createdAt: 'asc' })
            .populate('userSender', 'username')
            .populate({
                path: 'agentSender',
                select: 'customName',
            });
        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
// getChatsForUser now populates the agents
export const getChatsForUser = async (req: Request, res: Response) => {
    const userId = req.user._id;
    try {
        const chats = await Chat.find({ user: userId })
            .populate({
                path: 'agents',
                populate: { path: 'aiModel' } // Also populate the aiModel inside the agent
            })
            .sort({ updatedAt: -1 });
        res.json(chats);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

//  Add an agent to a chat
export const addAgentToChat = async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const { agentId } = req.body;
    const userId = req.user._id;

    try {
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chatId, user: userId },
            { $addToSet: { agents: agentId } }, // $addToSet prevents duplicates
            { new: true }
        ).populate({
            path: 'agents',
            populate: { path: 'aiModel' }
        });

        if (!updatedChat) {
            return res.status(404).json({ message: 'Chat not found or access denied' });
        }
        res.json(updatedChat);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

//Remove an agent from a chat
export const removeAgentFromChat = async (req: Request, res: Response) => {
    const { chatId, agentId } = req.params;
    const userId = req.user._id;

    try {
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chatId, user: userId },
            { $pull: { agents: agentId } }, // $pull removes the item from the array
            { new: true }
        ).populate({
            path: 'agents',
            populate: { path: 'aiModel' }
        });

        if (!updatedChat) {
            return res.status(404).json({ message: 'Chat not found or access denied' });
        }
        res.json(updatedChat);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};