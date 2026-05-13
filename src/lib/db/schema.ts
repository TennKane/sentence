import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const sentences = sqliteTable("sentences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  source: text("source"),
  tags: text("tags"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
