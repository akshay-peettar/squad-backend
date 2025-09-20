import GeminiService from './GeminiService';
import OpenAiService from './OpenAiService';
import { buildPromptWithContext } from './promptBuilder';

class AIGenerationService {
  public static async generateResponse(
    text: string,
    chatId: string,
    userId: string,
    agent: any,
    shortTermMemory: string
  ): Promise<string> {
    
    const prompt = await buildPromptWithContext(text, chatId, userId, agent, shortTermMemory);
    let aiResponseText = "This AI provider is not yet supported.";

    if (agent.aiModel.provider === 'Google') {
      aiResponseText = await GeminiService.generateResponse(prompt, agent ,chatId);
    } else if (agent.aiModel.provider === 'OpenAI') {
      aiResponseText = await OpenAiService.generateResponse(prompt, agent ,chatId);
    }
    
    return aiResponseText;
  }
}

export default AIGenerationService;