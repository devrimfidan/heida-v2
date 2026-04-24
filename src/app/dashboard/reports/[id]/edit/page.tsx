import { db } from "@/db";
import { dataEntries, dataEntryYears, departments, subDepartments, indicators } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditDataEntryClient } from "./edit-client";

export default async function EditReportPage({ params }: { params: { id: string } }) {
  const [entry] = await db
    .select()
    .from(dataEntries)
    .where(eq(dataEntries.id, params.id));

  if (!entry) notFound();

  const years = await db
    .select()
    .from(dataEntryYears)
    .where(eq(dataEntryYears.dataEntryId, entry.id));

  // We need to pass departments, subDepartments, and the indicator details to the client
  const allDepts = await db.select().from(departments);
  const allSubDepts = await db.select().from(subDepartments);
  const [indicator] = await db
    .select()
    .from(indicators)
    .where(eq(indicators.id, entry.indicatorId));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Edit Data Entry</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update the department assignment, period, visibility, and yearly values.
        </p>
      </div>
      <EditDataEntryClient
        entry={entry}
        years={years}
        indicator={indicator}
        departments={allDepts}
        subDepartments={allSubDepts}
      />
    </div>
  );
}
