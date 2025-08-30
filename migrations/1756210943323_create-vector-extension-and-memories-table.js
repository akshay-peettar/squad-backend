exports.up = (pgm) => {
    pgm.createExtension("vector", { ifNotExists: true });
    pgm.createTable("memories", {
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
    pgm.dropTable("memories");
    pgm.dropExtension("vector", { ifExists: true });
  };