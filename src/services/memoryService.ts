import { Document } from "langchain/document";
import { EmbeddingsInterface } from "@langchain/core/embeddings";
import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { pgPool } from "../config/db";

// This will now hold instances for each provider
const vectorStores: { [key: string]: PGVectorStore } = {};

/**
 * Initializes and returns a singleton instance of the PGVectorStore for the
 * currently configured provider.
 */
const getVectorStore = async (): Promise<PGVectorStore> => {
  const provider = process.env.EMBEDDING_PROVIDER?.toLowerCase() || "openai";

  if (vectorStores[provider]) {
    return vectorStores[provider];
  }

  let embeddings: EmbeddingsInterface;
  let tableName: string;

  switch (provider) {
    case "google":
      console.log("🧠 Using Google Gemini for embeddings.");
      embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: "embedding-001",
      });
      tableName = "memories_google";
      break;

    case "openai":
    default:
      console.log("🧠 Using OpenAI for embeddings.");
      embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "text-embedding-3-small",
      });
      tableName = "memories_openai";
      break;
  }

  const config = {
    pool: pgPool,
    tableName: tableName, // Use the dynamic table name
    columns: {
      idColumnName: "id",
      vectorColumnName: "embedding",
      contentColumnName: "content",
      metadataColumnName: "metadata",
    },
  };

  const store = await PGVectorStore.initialize(embeddings, config);
  vectorStores[provider] = store; // Cache the instance
  return store;
};

class MemoryService {
  public static async createMemory(
    content: string,
    userId: string,
    userAgentId: string
  ): Promise<void> {
    try {
      const store = await getVectorStore(); // This is now dynamic
      const document = new Document({
        pageContent: content,
        metadata: { user_id: userId, user_agent_id: userAgentId },
      });
      await store.addDocuments([document]);
      console.log(`🧠 Memory created successfully in ${store.tableName}.`);
    } catch (error) {
      console.error("❌ Error creating memory:", error);
    }
  }

  public static async fetchRelevantMemories(
    query: string,
    userId: string,
    userAgentId: string
  ): Promise<string> {
    try {
      const store = await getVectorStore(); // This is also dynamic
      const results = await store.similaritySearch(query, 4, {
        user_id: userId,
        user_agent_id: userAgentId,
      });

      if (results.length === 0) {
        return "No relevant memories found.";
      }

      console.log(`🧠 Fetched memories from ${store.tableName}.`);
      return results.map((doc) => doc.pageContent).join("\n---\n");
    } catch (error) {
      console.error("❌ Error fetching memories:", error);
      return "Error fetching memories.";
    }
  }
}

export default MemoryService;