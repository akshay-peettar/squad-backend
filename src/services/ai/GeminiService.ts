import { GoogleGenerativeAI } from '@google/generative-ai';
import CryptoService from '../cryptoService';
import ApiCallLog from '../../models/apiCallLogModel'; // 👈 Import the logging model

class GeminiService {
  /**
   * Generates a chat response and logs the token usage.
   * @param prompt - The user's message.
   * @param userAgent - The user's agent object from the database.
   * @returns The generated text response from the Gemini API.
   */
  public static async generateResponse(prompt: string, userAgent: any, chatId: string): Promise<string> {
    const startTime = Date.now();
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is not configured on the server.");
      }
      // const apiKey = CryptoService.decrypt(userAgent.apiKey); // currently using global key
      const userGenAI = new GoogleGenerativeAI(apiKey);
      const model = userGenAI.getGenerativeModel({ model: userAgent.aiModel.modelName });

      // --- TOKEN CALCULATION (THE FIX) ---
      // 1. Calculate prompt tokens BEFORE making the API call
      const promptTokenCount = await model.countTokens(prompt);

      // 2. Make the API call to get the response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      const endTime = Date.now();

      // 3. Calculate completion tokens AFTER getting the response
      const completionTokenCount = await model.countTokens(responseText);
      // --- END TOKEN CALCULATION ---

      // 4. Log everything to our analytics collection
      new ApiCallLog({
        owner: userAgent.owner,
        userAgent: userAgent._id,
        provider: 'Google',
        prompt,
        callType: 'user',
        chat: chatId,
        response: responseText,
        promptTokens: promptTokenCount.totalTokens,
        completionTokens: completionTokenCount.totalTokens,
        totalTokens: promptTokenCount.totalTokens + completionTokenCount.totalTokens,
        latency: endTime - startTime,
      }).save();

      return responseText;
    } catch (error) {
      console.error("Error generating Gemini response:", error);
      return "Sorry, there was an error with the Gemini agent.";
    }
  }
}

export default GeminiService;
