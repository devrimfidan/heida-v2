import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { departments, subDepartments } from "./departments";
import { indicators } from "./indicators";
import { users } from "./users";
import { criteria, answers } from "./criteria";

export const periodTypeEnum = pgEnum("period_type", ["calendar", "academic"]);

export const dataEntries = pgTable(
  "data_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    subDepartmentId: uuid("sub_department_id").references(
      () => subDepartments.id,
      { onDelete: "set null" }
    ),
    departmentDesc: text("department_desc"),
    indicatorId: uuid("indicator_id")
      .notNull()
      .references(() => indicators.id, { onDelete: "restrict" }),
    periodType: periodTypeEnum("period_type").notNull().default("calendar"),
    visibility: text("visibility").notNull().default("public"),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    indicatorIdIdx: index("indicator_id_idx").on(t.indicatorId),
    departmentIdIdx: index("department_id_idx").on(t.departmentId),
  })
);

export const dataEntryYears = pgTable(
  "data_entry_years",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dataEntryId: uuid("data_entry_id")
      .notNull()
      .references(() => dataEntries.id, { onDelete: "cascade" }),
    year: text("year").notNull(),
    value: text("value").notNull(),
  },
  (t) => ({
    dataEntryIdIdx: index("data_entry_id_idx").on(t.dataEntryId),
  })
);

export const dataEntryCriteria = pgTable("data_entry_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  dataEntryId: uuid("data_entry_id")
    .notNull()
    .references(() => dataEntries.id, { onDelete: "cascade" }),
  criteriaId: uuid("criteria_id")
    .notNull()
    .references(() => criteria.id, { onDelete: "restrict" }),
  freeText: text("free_text"),
});

export const dataEntryCriteriaAnswers = pgTable(
  "data_entry_criteria_answers",
  {
    dataEntryCriteriaId: uuid("data_entry_criteria_id")
      .notNull()
      .references(() => dataEntryCriteria.id, { onDelete: "cascade" }),
    answerId: uuid("answer_id")
      .notNull()
      .references(() => answers.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.dataEntryCriteriaId, t.answerId] }),
  })
);

export type DataEntry = typeof dataEntries.$inferSelect;
export type NewDataEntry = typeof dataEntries.$inferInsert;
export type DataEntryYear = typeof dataEntryYears.$inferSelect;
export type DataEntryCriteria = typeof dataEntryCriteria.$inferSelect;
