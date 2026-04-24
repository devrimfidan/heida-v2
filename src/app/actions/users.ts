"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function updateUserRole(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const role = Number(formData.get("role"));
  if (![1, 2, 3, 4].includes(role)) throw new Error("Invalid role value");
  await db.update(users).set({ role }).where(eq(users.id, id));
  revalidatePath("/dashboard/admin/users");
}
