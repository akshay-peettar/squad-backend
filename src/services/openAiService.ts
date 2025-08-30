import OpenAI from 'openai';
import CryptoService from './cryptoService';
import ApiCallLog from '../models/apiCallLogModel';

class OpenAiService {
  /**
   * Generates a chat response using a specific user's OpenAI agent.
   * @param prompt - The user's message.
   * @param userAgent - The user's agent object from the database.
   * @returns The generated text response from the OpenAI API.
   */
  public static async generateResponse(prompt: string, userAgent: any): Promise<string> {
    const startTime = Date.now();
    try {
      const apiKey = CryptoService.decrypt(userAgent.apiKey);
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: userAgent.aiModel.modelName,
      });

      const endTime = Date.now();
      const responseText = completion.choices[0].message.content || "";
      const usage = completion.usage;

      // Log the API call for analysis
      new ApiCallLog({
        owner: userAgent.owner,
        userAgent: userAgent._id,
        provider: 'OpenAI',
        prompt,
        response: responseText,
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
        latency: endTime - startTime,
        // We can add cost calculation later based on the model
      }).save();

      return responseText;
    } catch (error) {
      console.error("Error generating OpenAI response:", error);
      return "Sorry, I encountered an error with the OpenAI agent.";
    }
  }
}

export default OpenAiService;