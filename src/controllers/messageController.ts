import { Request, Response } from 'express';
import Message from '../models/messageModel';
import UserAgent from '../models/userAgentModel';
import GeminiService from '../services/geminiService';
import OpenAiService from '../services/openAiService';
import MemoryService from '../services/memoryService';

export const getMessages = async (req: Request, res: Response) => {
    try {
        const messages = await Message.find({})
            .sort({ createdAt: 'asc' })
            .limit(100)
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
export const createMessage = async (req: Request, res: Response) => {
    const { text } = req.body;
    const userId = req.user._id;
    const io = req.app.get('socketio');

    if (!text) {
        return res.status(400).json({ message: 'Message text is required' });
    }

    try {
        // 1. Save and broadcast user's message
        const userMessage = new Message({ text, senderType: 'User', userSender: userId });
        const savedUserMessage = await userMessage.save();
        const populatedUserMessage = await savedUserMessage.populate('userSender', 'username');
        io.emit('receive_message', populatedUserMessage);

        res.status(202).json({ message: "Message received, processing AI response." });

        const taggedAgentName = text.match(/@(\w+)/)?.[1];
        if (taggedAgentName) {
            const agent: any = await UserAgent.findOne({ owner: userId, customName: taggedAgentName }).populate('aiModel');
            if (!agent) return;
            io.emit('agent_typing', { agentName: agent.customName });
            // --- START OF HYBRID RETRIEVAL ---
            // 2. Create a memory of the user's message
            await MemoryService.createMemory(text, userId, agent._id);

            // 3. Fetch Long-Term Memory (Semantic Search)
            const longTermMemory = await MemoryService.fetchRelevantMemories(text, userId, agent._id);

            // 4. Fetch Short-Term Memory (Last 4 messages)
            const recentMessages = await Message.find()
                .sort({ createdAt: -1 })
                .limit(4)
                .populate('userSender', 'username')
                .populate({ path: 'agentSender', select: 'customName' });

            // Format the recent messages into a clean transcript
            const shortTermMemory = recentMessages.reverse().map(msg => {
                if (msg.senderType === 'User' && msg.userSender) {
                    return `${(msg.userSender as any).username}: ${msg.text}`;
                } else if (msg.senderType === 'AI' && msg.agentSender) {
                    return `${(msg.agentSender as any).customName}: ${msg.text}`;
                }
                return `Unknown: ${msg.text}`;
            }).join('\n');

            // --- END OF HYBRID RETRIEVAL ---


            let aiResponseText = "";

            // 5. Construct the new, improved prompt
            const promptWithContext = `
            # INSTRUCTION
            You are an AI assistant and part of a collaborative AI squad. The user may ask you follow-up questions based on recent conversations with other agents. Use all of the context provided below (both long-term and short-term memory) to form your response.

            # LONG-TERM MEMORY (Relevant past knowledge)
            ${longTermMemory}

            # SHORT-TERM MEMORY (The most recent messages in the chat)
            ${shortTermMemory}

            # CURRENT PROMPT
            Based on all the context above, respond to this prompt from the user: "${text}"
            `;
            console.log("---- Prompt with Context ----",promptWithContext);
            if (agent.aiModel.provider === 'Google') {
                aiResponseText = await GeminiService.generateResponse(promptWithContext, agent);
            } else if (agent.aiModel.provider === 'OpenAI') {
                aiResponseText = await OpenAiService.generateResponse(promptWithContext, agent);
            } else {
                aiResponseText = "This AI provider is not yet supported.";
            }

            // 6. Save, broadcast, and create memory for the AI's response
            const aiMessage = new Message({ text: aiResponseText, senderType: 'AI', agentSender: agent._id });
            const savedAiMessage = await aiMessage.save();
            const populatedAiMessage = await savedAiMessage.populate({ path: 'agentSender', select: 'customName' });
            io.emit('receive_message', populatedAiMessage);

            await MemoryService.createMemory(aiResponseText, userId, agent._id);

            io.emit('agent_stopped_typing');
        }
    } catch (error: any) {
        console.error("Error in createMessage:", error);
    }
};