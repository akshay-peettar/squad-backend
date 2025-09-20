import { Server } from 'socket.io';
import Chat from '../models/chatModel';
import { GoogleGenerativeAI } from '@google/generative-ai';

class ChatService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public async generateAndSaveTitle(chatId: string, firstMessage: string): Promise<void> {
    try {
      console.log(`🧠 Generating title for chat ${chatId}...`);
      const prompt = `Summarize the following user prompt into a short, descriptive title of 5 words or less. Do not use quotes. User Prompt: "${firstMessage}"`;

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const newTitle = result.response.text().replace(/"/g, '').trim();

      await Chat.findByIdAndUpdate(chatId, { title: newTitle });
      console.log(`✅ Title for chat ${chatId} updated to: "${newTitle}"`);

      this.io.to(chatId).emit('chat_updated', { _id: chatId, title: newTitle });
    } catch (error) {
      console.error(`❌ Error generating title for chat ${chatId}:`, error);
    }
  }
}

export default ChatService;