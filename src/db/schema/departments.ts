import {
  pgTable,
  uuid,
  text,
  timestamp,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const DEPARTMENT_TYPES = [
  "Faculty",
  "Graduate School",
  "Administrative Department",
  "Research Centre",
  "Other",
] as const;

export type DepartmentType = (typeof DEPARTMENT_TYPES)[number];

export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code"),
  type: text("type").default("Other"),
  website: text("website"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subDepartments = pgTable("sub_departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code"),
  type: text("type").default("Other"),
  website: text("website"),
  sortOrder: integer("sort_order").notNull().default(0),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userDepartments = pgTable(
  "user_departments",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.departmentId] }),
  })
);

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type SubDepartment = typeof subDepartments.$inferSelect;
export type NewSubDepartment = typeof subDepartments.$inferInsert;
