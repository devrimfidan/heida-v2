import { db } from "@/db";
import { dataEntries, indicators, subGroups, groups, departments, subDepartments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReportsTable } from "@/components/reports/reports-table";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { dept?: string; q?: string };
}) {
  const entries = await db
    .select({
      id: dataEntries.id,
      indicatorId: indicators.id,
      indicatorCode: indicators.code,
      indicatorName: indicators.name,
      group: groups.name,
      subGroup: subGroups.name,
      department: departments.name,
      subDepartment: subDepartments.name,
      departmentDesc: dataEntries.departmentDesc,
      periodType: dataEntries.periodType,
      visibility: dataEntries.visibility,
      createdAt: dataEntries.createdAt,
    })
    .from(dataEntries)
    .innerJoin(indicators, eq(dataEntries.indicatorId, indicators.id))
    .innerJoin(subGroups, eq(indicators.subGroupId, subGroups.id))
    .innerJoin(groups, eq(subGroups.groupId, groups.id))
    .leftJoin(departments, eq(dataEntries.departmentId, departments.id))
    .leftJoin(subDepartments, eq(dataEntries.subDepartmentId, subDepartments.id))
    .orderBy(desc(dataEntries.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {entries.length} data entr{entries.length !== 1 ? "ies" : "y"} recorded
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/data">+ New Entry</Link>
        </Button>
      </div>

      <ReportsTable entries={entries} />
    </div>
  );
}
