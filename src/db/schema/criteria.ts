import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const criteria = pgTable("criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  multiple: boolean("multiple").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const answers = pgTable("answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  criteriaId: uuid("criteria_id")
    .notNull()
    .references(() => criteria.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Criteria = typeof criteria.$inferSelect;
export type NewCriteria = typeof criteria.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
