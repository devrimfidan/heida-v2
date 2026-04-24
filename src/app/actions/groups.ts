"use server";

import { db } from "@/db";
import { groups, subGroups } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MIN_ROLE_ADMIN } from "@/lib/constants";
import { z } from "zod";

const REVALIDATE_PATH = "/dashboard/admin/groups";

const GroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
});

const SubGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  groupId: z.string().uuid("Invalid group ID"),
});

export async function createGroup(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < MIN_ROLE_ADMIN) throw new Error("Forbidden");

  const parsed = GroupSchema.parse({ name: formData.get("name") });

  try {
    await db.insert(groups).values({ name: parsed.name });
  } catch (err) {
    throw new Error("Failed to create group");
  }
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function updateGroup(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const parsed = GroupSchema.parse({ name: formData.get("name") });

  try {
    await db.update(groups).set({ name: parsed.name }).where(eq(groups.id, id));
  } catch (err) {
    throw new Error("Failed to update group");
  }
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function deleteGroup(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  try {
    await db.delete(groups).where(eq(groups.id, id));
  } catch (err) {
    throw new Error("Failed to delete group");
  }
  revalidatePath(REVALIDATE_PATH);
}

export async function createSubGroup(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const parsed = SubGroupSchema.parse({
    name: formData.get("name"),
    groupId: formData.get("groupId"),
  });

  try {
    await db.insert(subGroups).values({ name: parsed.name, groupId: parsed.groupId });
  } catch (err) {
    throw new Error("Failed to create sub-group");
  }
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function updateSubGroup(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const parsed = SubGroupSchema.parse({
    name: formData.get("name"),
    groupId: formData.get("groupId"),
  });

  try {
    await db
      .update(subGroups)
      .set({ name: parsed.name, groupId: parsed.groupId })
      .where(eq(subGroups.id, id));
  } catch (err) {
    throw new Error("Failed to update sub-group");
  }
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function deleteSubGroup(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  try {
    await db.delete(subGroups).where(eq(subGroups.id, id));
  } catch (err) {
    throw new Error("Failed to delete sub-group");
  }
  revalidatePath(REVALIDATE_PATH);
}
