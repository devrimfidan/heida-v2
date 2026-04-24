"use server";

import { db } from "@/db";
import { dataEntries, dataEntryYears } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

function revalidateAll() {
  revalidatePath("/dashboard/reports");
  revalidatePath("/dashboard/data");
}

export async function createDataEntry(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 3) throw new Error("Forbidden");

  const indicatorId = formData.get("indicatorId") as string;
  const departmentId = (formData.get("departmentId") as string) || null;
  const subDepartmentId = (formData.get("subDepartmentId") as string) || null;
  const departmentDesc = (formData.get("departmentDesc") as string) || null;
  const periodType = (formData.get("periodType") as "calendar" | "academic") ?? "calendar";
  const visibility = (formData.get("visibility") as string) ?? "public";
  const createdBy = session.user.id;

  const [entry] = await db
    .insert(dataEntries)
    .values({
      indicatorId,
      departmentId: departmentId || undefined,
      subDepartmentId: subDepartmentId || undefined,
      departmentDesc: departmentDesc || undefined,
      periodType,
      visibility,
      createdBy,
    })
    .returning();

  // Insert year-value pairs
  const years = formData.getAll("year") as string[];
  const values = formData.getAll("value") as string[];
  const yearRows = years
    .map((year, i) => ({ year, value: values[i] ?? "" }))
    .filter((r) => r.year && r.value);

  if (yearRows.length > 0) {
    await db.insert(dataEntryYears).values(
      yearRows.map((r) => ({ dataEntryId: entry.id, year: r.year, value: r.value }))
    );
  }

  revalidateAll();
  redirect("/dashboard/reports");
}

export async function updateDataEntry(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 3) throw new Error("Forbidden");

  const indicatorId = formData.get("indicatorId") as string;
  const departmentId = (formData.get("departmentId") as string) || undefined;
  const subDepartmentId = (formData.get("subDepartmentId") as string) || undefined;
  const departmentDesc = (formData.get("departmentDesc") as string) || undefined;
  const periodType = (formData.get("periodType") as "calendar" | "academic") ?? "calendar";
  const visibility = (formData.get("visibility") as string) ?? "public";

  await db
    .update(dataEntries)
    .set({ indicatorId, departmentId, subDepartmentId, departmentDesc, periodType, visibility })
    .where(eq(dataEntries.id, id));

  // Replace years
  await db.delete(dataEntryYears).where(eq(dataEntryYears.dataEntryId, id));

  const years = formData.getAll("year") as string[];
  const values = formData.getAll("value") as string[];
  const yearRows = years
    .map((year, i) => ({ year, value: values[i] ?? "" }))
    .filter((r) => r.year && r.value);

  if (yearRows.length > 0) {
    await db.insert(dataEntryYears).values(
      yearRows.map((r) => ({ dataEntryId: id, year: r.year, value: r.value }))
    );
  }

  revalidateAll();
  redirect("/dashboard/reports");
}

export async function deleteDataEntry(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 3) throw new Error("Forbidden");

  await db.delete(dataEntries).where(eq(dataEntries.id, id));
  revalidateAll();
}
