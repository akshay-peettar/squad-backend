import { Request, Response } from 'express';
import Message from '../models/messageModel';
import MemoryService from '../services/memoryService';
import Chat from '../models/chatModel';
import AIGenerationService from '../services/ai/AIGenerationService';
import ChatService from '../services/ChatService';

export const createMessage = async (req: Request, res: Response) => {
    const { text, chatId } = req.body;
    const userId = req.user._id;
    const io = req.app.get('socketio');
    const chatService = new ChatService(io);
    let agent: any;

    if (!text || !chatId) {
        return res.status(400).json({ message: 'Message text and chatId are required' });
    }

    try {
        const chat = await Chat.findOne({ _id: chatId, user: userId }).populate({
            path: 'agents',
            model: 'UserAgent',
            populate: { path: 'aiModel', model: 'AiModel' }
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found or access denied' });
        }

        const messageCount = await Message.countDocuments({ chat: chatId });
        if (messageCount === 0) {
            chatService.generateAndSaveTitle(chatId, text);
        }

        const userMessage = new Message({ text, senderType: 'User', userSender: userId, chat: chatId });
        const savedUserMessage = await userMessage.save();
        const populatedUserMessage = await savedUserMessage.populate('userSender', 'username');
        io.to(chatId).emit('receive_message', populatedUserMessage);

        res.status(202).json({ message: "Message received, processing AI response." });

        const taggedAgent = chat.agents.find((agent: any) => text.includes(`@${agent.customName}`));

        if (taggedAgent) {
            agent = taggedAgent;
            io.to(chatId).emit('agent_typing', { agentName: agent.customName });

            await MemoryService.createMemory(text, userId, agent._id, chatId);

            // Fetch recent messages to create the short-term memory context.
            const recentMessages = await Message.find({ chat: chatId })
                .sort({ createdAt: -1 }).limit(4)
                .populate('userSender', 'username')
                .populate({ path: 'agentSender', select: 'customName' });

            const shortTermMemory = recentMessages.reverse().map((msg: any) => {
                if (msg.senderType === 'User') return `${msg.userSender.username}: ${msg.text}`;
                return `${msg.agentSender.customName}: ${msg.text}`;
            }).join('\n');

            // Pass the short-term memory into the generation service.
            const aiResponseText = await AIGenerationService.generateResponse(text, chatId, userId, agent, shortTermMemory);

            const aiMessage = new Message({ text: aiResponseText, senderType: 'AI', agentSender: agent._id, chat: chatId });
            const savedAiMessage = await aiMessage.save();
            const populatedAiMessage = await savedAiMessage.populate({ path: 'agentSender', select: 'customName' });
            io.to(chatId).emit('receive_message', populatedAiMessage);

            await MemoryService.createMemory(aiResponseText, userId, agent._id, chatId);

            io.to(chatId).emit('agent_stopped_typing');
        }

    } catch (error: any) {
        console.error("Error in createMessage:", error);
        io.to(chatId).emit('agent_error', {
            message: `Sorry, @${agent?.customName || 'the agent'} encountered an error and could not respond.`
        });
        io.to(chatId).emit('agent_stopped_typing');
    }
};