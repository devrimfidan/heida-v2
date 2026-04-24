"use server";

import { db } from "@/db";
import { goals } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MIN_ROLE_ADMIN } from "@/lib/constants";
import { z } from "zod";

const GoalSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
});

export async function createGoal(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < MIN_ROLE_ADMIN) throw new Error("Forbidden");

  const parsed = GoalSchema.parse({ name: formData.get("name") });

  // 2.6 — wrap SELECT max + INSERT in a transaction to avoid race condition
  try {
    await db.transaction(async (tx) => {
      const result = await tx
        .select({ max: sql<number>`coalesce(max(${goals.sortOrder}), -1)` })
        .from(goals);
      const nextOrder = (result[0]?.max ?? -1) + 1;
      await tx.insert(goals).values({ name: parsed.name, sortOrder: nextOrder });
    });
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Failed to create goal");
  }

  revalidatePath("/dashboard/admin/goals");
  redirect("/dashboard/admin/goals");
}

export async function updateGoal(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < MIN_ROLE_ADMIN) throw new Error("Forbidden");

  const parsed = GoalSchema.parse({ name: formData.get("name") });

  try {
    await db.update(goals).set({ name: parsed.name }).where(eq(goals.id, id));
  } catch (err) {
    throw new Error("Failed to update goal");
  }
  revalidatePath("/dashboard/admin/goals");
  redirect("/dashboard/admin/goals");
}

export async function deleteGoal(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < MIN_ROLE_ADMIN) throw new Error("Forbidden");

  try {
    await db.delete(goals).where(eq(goals.id, id));
  } catch (err) {
    throw new Error("Failed to delete goal");
  }
  revalidatePath("/dashboard/admin/goals");
}

export async function reorderGoals(orderedIds: string[]) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < MIN_ROLE_ADMIN) throw new Error("Forbidden");

  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(goals)
          .set({ sortOrder: i })
          .where(eq(goals.id, orderedIds[i]));
      }
    });
  } catch (err) {
    throw new Error("Failed to reorder goals");
  }
  revalidatePath("/dashboard/admin/goals");
}
