import { db } from "@/db";
import { groups, subGroups, indicators, departments, subDepartments } from "@/db/schema";
import { asc } from "drizzle-orm";
import { DataEntryClient } from "./data-entry-client";

export default async function DataPage() {
  const [allGroups, allSubGroups, allIndicators, allDepts, allSubDepts] = await Promise.all([
    db.select().from(groups).orderBy(asc(groups.name)),
    db.select().from(subGroups).orderBy(asc(subGroups.name)),
    db.select({ id: indicators.id, code: indicators.code, name: indicators.name, valueType: indicators.valueType, subGroupId: indicators.subGroupId })
      .from(indicators).orderBy(asc(indicators.code)),
    db.select().from(departments).orderBy(asc(departments.name)),
    db.select().from(subDepartments).orderBy(asc(subDepartments.name)),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Entry</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Filter by group and sub-group, then select an indicator to enter data.
        </p>
      </div>
      <DataEntryClient
        goals={[]}
        groups={allGroups}
        subGroups={allSubGroups}
        indicators={allIndicators}
        departments={allDepts}
        subDepartments={allSubDepts}
      />
    </div>
  );
}
