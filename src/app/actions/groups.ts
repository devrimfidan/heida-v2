"use server";

import { db } from "@/db";
import { groups, subGroups } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const REVALIDATE_PATH = "/dashboard/admin/groups";

export async function createGroup(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const name = formData.get("name") as string;
  await db.insert(groups).values({ name });
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function updateGroup(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const name = formData.get("name") as string;
  await db.update(groups).set({ name }).where(eq(groups.id, id));
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function deleteGroup(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  await db.delete(groups).where(eq(groups.id, id));
  revalidatePath(REVALIDATE_PATH);
}

export async function createSubGroup(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const name = formData.get("name") as string;
  const groupId = formData.get("groupId") as string;
  await db.insert(subGroups).values({ name, groupId });
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function updateSubGroup(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  const name = formData.get("name") as string;
  const groupId = formData.get("groupId") as string;
  await db.update(subGroups).set({ name, groupId }).where(eq(subGroups.id, id));
  revalidatePath(REVALIDATE_PATH);
  redirect(REVALIDATE_PATH);
}

export async function deleteSubGroup(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 4) throw new Error("Forbidden");

  await db.delete(subGroups).where(eq(subGroups.id, id));
  revalidatePath(REVALIDATE_PATH);
}
