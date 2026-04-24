"use server";

import { db } from "@/db";
import { indicators, indicatorGoalScores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { z } from "zod";

const REVALIDATE_PATH = "/dashboard/indicators";

const VALUE_TYPES = ["yes_no", "numeric", "percentage"] as const;
const VISIBILITY_VALUES = ["public", "staff_only", "not_sure"] as const;

const IndicatorSchema = z.object({
  code: z.string().min(1, "Code is required").max(50),
  name: z.string().min(1, "Name is required").max(500),
  valueType: z.enum(VALUE_TYPES, { errorMap: () => ({ message: "Invalid value type" }) }),
  visibility: z.enum(VISIBILITY_VALUES, { errorMap: () => ({ message: "Invalid visibility" }) }),
  subGroupId: z.string().uuid("Invalid sub-group ID"),
});

function parseScores(formData: FormData, goalEntries: string[]) {
  return goalEntries.map((goalId) => {
    const raw = Number(formData.get(`score_${goalId}`));
    if (!Number.isInteger(raw) || raw < 0 || raw > 5) {
      throw new Error(`Invalid score for goal ${goalId}: must be integer 0–5`);
    }
    return { goalId, score: raw };
  });
}

export async function createIndicator(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const parsed = IndicatorSchema.parse({
    code: formData.get("code"),
    name: formData.get("name"),
    valueType: formData.get("valueType"),
    visibility: formData.get("visibility"),
    subGroupId: formData.get("subGroupId"),
  });

  const goalEntries = formData.getAll("goalId") as string[];
  const scores = parseScores(formData, goalEntries);

  try {
    const [indicator] = await db
      .insert(indicators)
      .values(parsed)
      .returning();

    for (const { goalId, score } of scores) {
      await db
        .insert(indicatorGoalScores)
        .values({ indicatorId: indicator.id, goalId, score })
        .onConflictDoUpdate({
          target: [indicatorGoalScores.indicatorId, indicatorGoalScores.goalId],
          set: { score },
        });
    }
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Failed to create indicator");
  }

  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function updateIndicator(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const parsed = IndicatorSchema.parse({
    code: formData.get("code"),
    name: formData.get("name"),
    valueType: formData.get("valueType"),
    visibility: formData.get("visibility"),
    subGroupId: formData.get("subGroupId"),
  });

  const goalEntries = formData.getAll("goalId") as string[];
  const scores = parseScores(formData, goalEntries);

  try {
    await db.update(indicators).set(parsed).where(eq(indicators.id, id));

    for (const { goalId, score } of scores) {
      await db
        .insert(indicatorGoalScores)
        .values({ indicatorId: id, goalId, score })
        .onConflictDoUpdate({
          target: [indicatorGoalScores.indicatorId, indicatorGoalScores.goalId],
          set: { score },
        });
    }
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Failed to update indicator");
  }

  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function deleteIndicator(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  try {
    await db.delete(indicators).where(eq(indicators.id, id));
  } catch (err) {
    throw new Error("Failed to delete indicator");
  }
  revalidatePath(REVALIDATE_PATH);
}
