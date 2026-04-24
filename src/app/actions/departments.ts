"use server";

import { db } from "@/db";
import { departments, subDepartments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const REVALIDATE_PATH = "/dashboard/admin/departments";

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");
  return session;
}

export async function createDepartment(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const code = (formData.get("code") as string) || null;
  const type = (formData.get("type") as string) || "Other";
  const website = (formData.get("website") as string) || null;

  // Auto-assign next sort order
  const result = await db
    .select({ max: sql<number>`coalesce(max(${departments.sortOrder}), -1)` })
    .from(departments);
  const nextOrder = (result[0]?.max ?? -1) + 1;

  await db.insert(departments).values({ name, code, type, website, sortOrder: nextOrder });
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function updateDepartment(id: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const code = (formData.get("code") as string) || null;
  const type = (formData.get("type") as string) || "Other";
  const website = (formData.get("website") as string) || null;
  await db.update(departments).set({ name, code, type, website }).where(eq(departments.id, id));
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function deleteDepartment(id: string) {
  await requireAdmin();

  await db.delete(departments).where(eq(departments.id, id));
  revalidatePath(REVALIDATE_PATH);
}

export async function reorderDepartments(orderedIds: string[]) {
  await requireAdmin();

  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(departments)
        .set({ sortOrder: i })
        .where(eq(departments.id, orderedIds[i]));
    }
  });
  revalidatePath(REVALIDATE_PATH);
}

export async function createSubDepartment(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const departmentId = formData.get("departmentId") as string;
  const code = (formData.get("code") as string) || null;
  const type = (formData.get("type") as string) || "Other";
  const website = (formData.get("website") as string) || null;

  // Auto-assign next sort order
  const result = await db
    .select({ max: sql<number>`coalesce(max(${subDepartments.sortOrder}), -1)` })
    .from(subDepartments);
  const nextOrder = (result[0]?.max ?? -1) + 1;

  await db.insert(subDepartments).values({ name, departmentId, code, type, website, sortOrder: nextOrder });
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function updateSubDepartment(id: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const departmentId = formData.get("departmentId") as string;
  const code = (formData.get("code") as string) || null;
  const type = (formData.get("type") as string) || "Other";
  const website = (formData.get("website") as string) || null;
  await db
    .update(subDepartments)
    .set({ name, departmentId, code, type, website })
    .where(eq(subDepartments.id, id));
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function deleteSubDepartment(id: string) {
  await requireAdmin();

  await db.delete(subDepartments).where(eq(subDepartments.id, id));
  revalidatePath(REVALIDATE_PATH);
}

export async function reorderSubDepartments(orderedIds: string[]) {
  await requireAdmin();

  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(subDepartments)
        .set({ sortOrder: i })
        .where(eq(subDepartments.id, orderedIds[i]));
    }
  });
  revalidatePath(REVALIDATE_PATH);
}
