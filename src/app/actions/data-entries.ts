"use server";

import { db } from "@/db";
import { dataEntries, dataEntryYears } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MIN_ROLE_DATA_ENTRY } from "@/lib/constants";
import { z } from "zod";

const YEAR_REGEX = /^\d{4}(-\d{4})?$/;

const PERIOD_TYPES = ["calendar", "academic"] as const;
const VISIBILITY_VALUES = ["public", "staff_only", "not_sure"] as const;

const YearValueSchema = z.object({
  year: z.string().regex(YEAR_REGEX, "Year must be YYYY or YYYY-YYYY"),
  value: z.string().min(1).max(255),
});

const DataEntrySchema = z.object({
  indicatorId: z.string().uuid("Invalid indicator ID"),
  periodType: z.enum(PERIOD_TYPES, { errorMap: () => ({ message: "Invalid period type" }) }),
  visibility: z.enum(VISIBILITY_VALUES, { errorMap: () => ({ message: "Invalid visibility" }) }),
  departmentId: z.string().uuid().optional().nullable(),
  subDepartmentId: z.string().uuid().optional().nullable(),
  departmentDesc: z.string().max(500).optional().nullable(),
});

function parseYearRows(formData: FormData) {
  const years = formData.getAll("year") as string[];
  const values = formData.getAll("value") as string[];
  const rows = years
    .map((year, i) => ({ year, value: values[i] ?? "" }))
    .filter((r) => r.year && r.value);

  return rows.map((r) => YearValueSchema.parse(r));
}

function revalidateAll() {
  revalidatePath("/dashboard/reports");
  revalidatePath("/dashboard/data");
}

export async function createDataEntry(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < MIN_ROLE_DATA_ENTRY) throw new Error("Forbidden");

  const raw = {
    indicatorId: formData.get("indicatorId"),
    periodType: formData.get("periodType") ?? "calendar",
    visibility: formData.get("visibility") ?? "public",
    departmentId: (formData.get("departmentId") as string) || null,
    subDepartmentId: (formData.get("subDepartmentId") as string) || null,
    departmentDesc: (formData.get("departmentDesc") as string) || null,
  };

  const parsed = DataEntrySchema.parse(raw);
  const yearRows = parseYearRows(formData);
  const createdBy = session.user.id;

  try {
    const [entry] = await db
      .insert(dataEntries)
      .values({
        indicatorId: parsed.indicatorId,
        departmentId: parsed.departmentId ?? undefined,
        subDepartmentId: parsed.subDepartmentId ?? undefined,
        departmentDesc: parsed.departmentDesc ?? undefined,
        periodType: parsed.periodType,
        visibility: parsed.visibility,
        createdBy,
      })
      .returning();

    if (yearRows.length > 0) {
      await db.insert(dataEntryYears).values(
        yearRows.map((r) => ({ dataEntryId: entry.id, year: r.year, value: r.value }))
      );
    }
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Failed to create data entry");
  }

  revalidateAll();
  redirect("/dashboard/reports");
}

export async function updateDataEntry(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 3) throw new Error("Forbidden");

  const raw = {
    indicatorId: formData.get("indicatorId"),
    periodType: formData.get("periodType") ?? "calendar",
    visibility: formData.get("visibility") ?? "public",
    departmentId: (formData.get("departmentId") as string) || null,
    subDepartmentId: (formData.get("subDepartmentId") as string) || null,
    departmentDesc: (formData.get("departmentDesc") as string) || null,
  };

  const parsed = DataEntrySchema.parse(raw);
  const yearRows = parseYearRows(formData);

  try {
    await db
      .update(dataEntries)
      .set({
        indicatorId: parsed.indicatorId,
        departmentId: parsed.departmentId ?? undefined,
        subDepartmentId: parsed.subDepartmentId ?? undefined,
        departmentDesc: parsed.departmentDesc ?? undefined,
        periodType: parsed.periodType,
        visibility: parsed.visibility,
      })
      .where(eq(dataEntries.id, id));

    await db.delete(dataEntryYears).where(eq(dataEntryYears.dataEntryId, id));

    if (yearRows.length > 0) {
      await db.insert(dataEntryYears).values(
        yearRows.map((r) => ({ dataEntryId: id, year: r.year, value: r.value }))
      );
    }
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Failed to update data entry");
  }

  revalidateAll();
  redirect("/dashboard/reports");
}

export async function deleteDataEntry(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if ((session.user.role ?? 0) < 3) throw new Error("Forbidden");

  try {
    await db.delete(dataEntries).where(eq(dataEntries.id, id));
  } catch (err) {
    throw new Error("Failed to delete data entry");
  }
  revalidateAll();
}
