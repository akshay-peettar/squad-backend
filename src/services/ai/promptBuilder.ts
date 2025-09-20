import Message from '../../models/messageModel';
import MemoryService from '../memoryService';

export const buildPromptWithContext = async (
    text: string,
    chatId: string,
    userId: string,
    agent: any,
    shortTermMemory: string
): Promise<string> => {
    
    // --- 👇 COST-EFFECTIVE RAG IMPLEMENTATION ---
    // 1. Create a richer search query by combining recent history and the new message.
    // This gives the vector database more context to find relevant memories.
    const searchQuery = shortTermMemory + '\n' + text;
    
    // 2. Fetch long-term memories using the improved search query.
    const longTermMemory = await MemoryService.fetchRelevantMemories(searchQuery, userId, agent._id, chatId);
    // --- END of RAG IMPLEMENTATION ---

    const promptWithContext = `
# SYSTEM INSTRUCTION
You are ${agent.customName}, an AI assistant participating in a group chat. Your purpose is to be a helpful and collaborative member of the AI squad.

# LONG-TERM MEMORY (Relevant past knowledge retrieved for this query)
${longTermMemory}

# CHAT HISTORY (The most recent messages in this conversation)
${shortTermMemory}
The user's latest message to you is: "${text}"

# YOUR TASK
Analyze the LONG-TERM MEMORY and CHAT HISTORY to generate the most appropriate response to the user's latest message.
Formulate the next appropriate response as ${agent.customName}. Do not greet the user unless it is the very first message.`;

    console.log("Constructed Prompt:", promptWithContext);
    return promptWithContext;
};