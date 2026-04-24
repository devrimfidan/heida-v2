import { relations } from "drizzle-orm";
import { users } from "./users";
import { departments, subDepartments, userDepartments } from "./departments";
import { goals } from "./goals";
import { groups } from "./groups";
import { subGroups, indicators, indicatorGoalScores } from "./indicators";
import { criteria, answers, } from "./criteria";
import {
  dataEntries,
  dataEntryYears,
  dataEntryCriteria,
  dataEntryCriteriaAnswers,
} from "./data";
import { accounts, sessions } from "./auth";

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  departments: many(userDepartments),
  dataEntries: many(dataEntries),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const goalsRelations = relations(goals, ({ many }) => ({
  indicatorScores: many(indicatorGoalScores),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  subGroups: many(subGroups),
}));

export const subGroupsRelations = relations(subGroups, ({ one, many }) => ({
  group: one(groups, { fields: [subGroups.groupId], references: [groups.id] }),
  indicators: many(indicators),
}));

export const indicatorsRelations = relations(indicators, ({ one, many }) => ({
  subGroup: one(subGroups, {
    fields: [indicators.subGroupId],
    references: [subGroups.id],
  }),
  goalScores: many(indicatorGoalScores),
  dataEntries: many(dataEntries),
}));

export const indicatorGoalScoresRelations = relations(
  indicatorGoalScores,
  ({ one }) => ({
    indicator: one(indicators, {
      fields: [indicatorGoalScores.indicatorId],
      references: [indicators.id],
    }),
    goal: one(goals, {
      fields: [indicatorGoalScores.goalId],
      references: [goals.id],
    }),
  })
);

export const departmentsRelations = relations(departments, ({ many }) => ({
  subDepartments: many(subDepartments),
  users: many(userDepartments),
  dataEntries: many(dataEntries),
}));

export const subDepartmentsRelations = relations(
  subDepartments,
  ({ one, many }) => ({
    department: one(departments, {
      fields: [subDepartments.departmentId],
      references: [departments.id],
    }),
    dataEntries: many(dataEntries),
  })
);

export const userDepartmentsRelations = relations(
  userDepartments,
  ({ one }) => ({
    user: one(users, {
      fields: [userDepartments.userId],
      references: [users.id],
    }),
    department: one(departments, {
      fields: [userDepartments.departmentId],
      references: [departments.id],
    }),
  })
);

export const criteriaRelations = relations(criteria, ({ many }) => ({
  answers: many(answers),
  dataEntryCriteria: many(dataEntryCriteria),
}));

export const answersRelations = relations(answers, ({ one, many }) => ({
  criteria: one(criteria, {
    fields: [answers.criteriaId],
    references: [criteria.id],
  }),
  dataEntryCriteriaAnswers: many(dataEntryCriteriaAnswers),
}));

export const dataEntriesRelations = relations(dataEntries, ({ one, many }) => ({
  department: one(departments, {
    fields: [dataEntries.departmentId],
    references: [departments.id],
  }),
  subDepartment: one(subDepartments, {
    fields: [dataEntries.subDepartmentId],
    references: [subDepartments.id],
  }),
  indicator: one(indicators, {
    fields: [dataEntries.indicatorId],
    references: [indicators.id],
  }),
  createdBy: one(users, {
    fields: [dataEntries.createdBy],
    references: [users.id],
  }),
  years: many(dataEntryYears),
  criteriaEntries: many(dataEntryCriteria),
}));

export const dataEntryYearsRelations = relations(dataEntryYears, ({ one }) => ({
  dataEntry: one(dataEntries, {
    fields: [dataEntryYears.dataEntryId],
    references: [dataEntries.id],
  }),
}));

export const dataEntryCriteriaRelations = relations(
  dataEntryCriteria,
  ({ one, many }) => ({
    dataEntry: one(dataEntries, {
      fields: [dataEntryCriteria.dataEntryId],
      references: [dataEntries.id],
    }),
    criteria: one(criteria, {
      fields: [dataEntryCriteria.criteriaId],
      references: [criteria.id],
    }),
    answers: many(dataEntryCriteriaAnswers),
  })
);

export const dataEntryCriteriaAnswersRelations = relations(
  dataEntryCriteriaAnswers,
  ({ one }) => ({
    dataEntryCriteria: one(dataEntryCriteria, {
      fields: [dataEntryCriteriaAnswers.dataEntryCriteriaId],
      references: [dataEntryCriteria.id],
    }),
    answer: one(answers, {
      fields: [dataEntryCriteriaAnswers.answerId],
      references: [answers.id],
    }),
  })
);
