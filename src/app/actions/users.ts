"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { MIN_ROLE_ADMIN, ROLES } from "@/lib/constants";

export async function updateUserRole(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < MIN_ROLE_ADMIN) throw new Error("Forbidden");

  const role = Number(formData.get("role"));
  if (!Object.values(ROLES).includes(role as any)) throw new Error("Invalid role value");
  try {
    await db.update(users).set({ role }).where(eq(users.id, id));
  } catch {
    throw new Error("Failed to update user role");
  }
  revalidatePath("/dashboard/admin/users");
}
