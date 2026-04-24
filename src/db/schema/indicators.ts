import {
  pgTable,
  uuid,
  text,
  smallint,
  timestamp,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { groups } from "./groups";
import { goals } from "./goals";

export const valueTypeEnum = pgEnum("value_type", [
  "yes_no",
  "numeric",
  "percentage",
]);

export const visibilityEnum = pgEnum("visibility", [
  "public",
  "staff_only",
  "not_sure",
]);

export const subGroups = pgTable("sub_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const indicators = pgTable("indicators", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  valueType: valueTypeEnum("value_type").notNull().default("numeric"),
  visibility: visibilityEnum("visibility").notNull().default("public"),
  subGroupId: uuid("sub_group_id")
    .notNull()
    .references(() => subGroups.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const indicatorGoalScores = pgTable(
  "indicator_goal_scores",
  {
    indicatorId: uuid("indicator_id")
      .notNull()
      .references(() => indicators.id, { onDelete: "cascade" }),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    score: smallint("score").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.indicatorId, t.goalId] }),
  })
);

export type SubGroup = typeof subGroups.$inferSelect;
export type NewSubGroup = typeof subGroups.$inferInsert;
export type Indicator = typeof indicators.$inferSelect;
export type NewIndicator = typeof indicators.$inferInsert;
export type IndicatorGoalScore = typeof indicatorGoalScores.$inferSelect;
