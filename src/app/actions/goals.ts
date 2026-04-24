"use server";

import { db } from "@/db";
import { goals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function createGoal(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const name = formData.get("name") as string;

  // Auto-assign next sort order
  const result = await db
    .select({ max: sql<number>`coalesce(max(${goals.sortOrder}), -1)` })
    .from(goals);
  const nextOrder = (result[0]?.max ?? -1) + 1;

  await db.insert(goals).values({ name, sortOrder: nextOrder });
  revalidatePath("/dashboard/admin/goals");
  redirect("/dashboard/admin/goals");
}

export async function updateGoal(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const name = formData.get("name") as string;

  await db.update(goals).set({ name }).where(eq(goals.id, id));
  revalidatePath("/dashboard/admin/goals");
  redirect("/dashboard/admin/goals");
}

export async function deleteGoal(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  await db.delete(goals).where(eq(goals.id, id));
  revalidatePath("/dashboard/admin/goals");
}

export async function reorderGoals(orderedIds: string[]) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(goals)
        .set({ sortOrder: i })
        .where(eq(goals.id, orderedIds[i]));
    }
  });
  revalidatePath("/dashboard/admin/goals");
}
