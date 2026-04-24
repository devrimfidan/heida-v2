"use server";

import { db } from "@/db";
import { indicators, indicatorGoalScores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const REVALIDATE_PATH = "/dashboard/indicators";

export async function createIndicator(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const valueType = formData.get("valueType") as "yes_no" | "numeric" | "percentage";
  const visibility = formData.get("visibility") as "public" | "staff_only" | "not_sure";
  const subGroupId = formData.get("subGroupId") as string;

  const [indicator] = await db
    .insert(indicators)
    .values({ code, name, valueType, visibility, subGroupId })
    .returning();

  // Upsert goal scores
  const goalEntries = formData.getAll("goalId") as string[];
  for (const goalId of goalEntries) {
    const score = Number(formData.get(`score_${goalId}`));
    await db
      .insert(indicatorGoalScores)
      .values({ indicatorId: indicator.id, goalId, score })
      .onConflictDoUpdate({
        target: [indicatorGoalScores.indicatorId, indicatorGoalScores.goalId],
        set: { score },
      });
  }

  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function updateIndicator(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const valueType = formData.get("valueType") as "yes_no" | "numeric" | "percentage";
  const visibility = formData.get("visibility") as "public" | "staff_only" | "not_sure";
  const subGroupId = formData.get("subGroupId") as string;

  await db
    .update(indicators)
    .set({ code, name, valueType, visibility, subGroupId })
    .where(eq(indicators.id, id));

  // Upsert goal scores
  const goalEntries = formData.getAll("goalId") as string[];
  for (const goalId of goalEntries) {
    const score = Number(formData.get(`score_${goalId}`));
    await db
      .insert(indicatorGoalScores)
      .values({ indicatorId: id, goalId, score })
      .onConflictDoUpdate({
        target: [indicatorGoalScores.indicatorId, indicatorGoalScores.goalId],
        set: { score },
      });
  }

  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function deleteIndicator(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  await db.delete(indicators).where(eq(indicators.id, id));
  revalidatePath(REVALIDATE_PATH);
}
