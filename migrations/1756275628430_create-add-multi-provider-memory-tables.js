// In migrations/*_add-multi-provider-memory-tables.js
exports.up = (pgm) => {
    // 1. Create the vector extension if it wasn't already
    pgm.createExtension("vector", { ifNotExists: true });
  
    // 2. Table for Google Gemini Embeddings (768 dimensions)
    pgm.createTable("memories_google", {
      id: "id",
      content: { type: "text", notNull: true },
      embedding: { type: "vector(768)", notNull: true },
      metadata: { type: "jsonb" },
      created_at: {
        type: "timestamp",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
    });
  
    // 3. Table for OpenAI Embeddings (1536 dimensions)
    pgm.createTable("memories_openai", {
      id: "id",
      content: { type: "text", notNull: true },
      embedding: { type: "vector(1536)", notNull: true },
      metadata: { type: "jsonb" },
      created_at: {
        type: "timestamp",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
    });
  };
  
  exports.down = (pgm) => {
    pgm.dropTable("memories_google");
    pgm.dropTable("memories_openai");
    // We can leave the extension to be removed by the first migration's down script
  };