"use server";

import { db } from "@/db";
import { departments, subDepartments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { z } from "zod";

const REVALIDATE_PATH = "/dashboard/admin/departments";

const DEPT_TYPES = ["Academic", "Administrative", "Research", "Other"] as const;

const DepartmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  code: z.string().max(50).optional().nullable(),
  type: z.enum(DEPT_TYPES).default("Other"),
  website: z.string().url().optional().nullable().or(z.literal("")),
});

const SubDepartmentSchema = DepartmentSchema.extend({
  departmentId: z.string().uuid("Invalid department ID"),
});

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");
  return session;
}

export async function createDepartment(formData: FormData) {
  await requireAdmin();

  const parsed = DepartmentSchema.parse({
    name: formData.get("name"),
    code: (formData.get("code") as string) || null,
    type: (formData.get("type") as string) || "Other",
    website: (formData.get("website") as string) || null,
  });

  // 2.6 — wrap SELECT max + INSERT in a transaction to avoid race condition
  try {
    await db.transaction(async (tx) => {
      const result = await tx
        .select({ max: sql<number>`coalesce(max(${departments.sortOrder}), -1)` })
        .from(departments);
      const nextOrder = (result[0]?.max ?? -1) + 1;
      await tx.insert(departments).values({ ...parsed, sortOrder: nextOrder });
    });
  } catch (err) {
    throw new Error("Failed to create department");
  }
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function updateDepartment(id: string, formData: FormData) {
  await requireAdmin();

  const parsed = DepartmentSchema.parse({
    name: formData.get("name"),
    code: (formData.get("code") as string) || null,
    type: (formData.get("type") as string) || "Other",
    website: (formData.get("website") as string) || null,
  });

  try {
    await db.update(departments).set(parsed).where(eq(departments.id, id));
  } catch (err) {
    throw new Error("Failed to update department");
  }
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function deleteDepartment(id: string) {
  await requireAdmin();

  try {
    await db.delete(departments).where(eq(departments.id, id));
  } catch (err) {
    throw new Error("Failed to delete department");
  }
  revalidatePath(REVALIDATE_PATH);
}

export async function reorderDepartments(orderedIds: string[]) {
  await requireAdmin();

  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(departments)
          .set({ sortOrder: i })
          .where(eq(departments.id, orderedIds[i]));
      }
    });
  } catch (err) {
    throw new Error("Failed to reorder departments");
  }
  revalidatePath(REVALIDATE_PATH);
}

export async function createSubDepartment(formData: FormData) {
  await requireAdmin();

  const parsed = SubDepartmentSchema.parse({
    name: formData.get("name"),
    departmentId: formData.get("departmentId"),
    code: (formData.get("code") as string) || null,
    type: (formData.get("type") as string) || "Other",
    website: (formData.get("website") as string) || null,
  });

  // 2.6 — wrap SELECT max + INSERT in a transaction to avoid race condition
  try {
    await db.transaction(async (tx) => {
      const result = await tx
        .select({ max: sql<number>`coalesce(max(${subDepartments.sortOrder}), -1)` })
        .from(subDepartments);
      const nextOrder = (result[0]?.max ?? -1) + 1;
      await tx.insert(subDepartments).values({ ...parsed, sortOrder: nextOrder });
    });
  } catch (err) {
    throw new Error("Failed to create sub-department");
  }
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function updateSubDepartment(id: string, formData: FormData) {
  await requireAdmin();

  const parsed = SubDepartmentSchema.parse({
    name: formData.get("name"),
    departmentId: formData.get("departmentId"),
    code: (formData.get("code") as string) || null,
    type: (formData.get("type") as string) || "Other",
    website: (formData.get("website") as string) || null,
  });

  try {
    await db
      .update(subDepartments)
      .set(parsed)
      .where(eq(subDepartments.id, id));
  } catch (err) {
    throw new Error("Failed to update sub-department");
  }
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function deleteSubDepartment(id: string) {
  await requireAdmin();

  try {
    await db.delete(subDepartments).where(eq(subDepartments.id, id));
  } catch (err) {
    throw new Error("Failed to delete sub-department");
  }
  revalidatePath(REVALIDATE_PATH);
}

export async function reorderSubDepartments(orderedIds: string[]) {
  await requireAdmin();

  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(subDepartments)
          .set({ sortOrder: i })
          .where(eq(subDepartments.id, orderedIds[i]));
      }
    });
  } catch (err) {
    throw new Error("Failed to reorder sub-departments");
  }
  revalidatePath(REVALIDATE_PATH);
}
