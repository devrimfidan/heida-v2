import { pgTable, uuid, text, smallint, timestamp } from "drizzle-orm/pg-core";

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  sortOrder: smallint("sort_order").notNull().default(0),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
