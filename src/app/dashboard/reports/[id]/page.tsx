import { db } from "@/db";
import { dataEntries, indicators, subGroups, groups, departments, subDepartments, dataEntryYears, indicatorGoalScores, goals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { YearChart } from "./chart";

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const [entry] = await db
    .select({
      id: dataEntries.id,
      indicatorId: dataEntries.indicatorId,
      indicatorCode: indicators.code,
      indicatorName: indicators.name,
      valueType: indicators.valueType,
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
    .where(eq(dataEntries.id, params.id));

  if (!entry) notFound();

  const years = await db
    .select()
    .from(dataEntryYears)
    .where(eq(dataEntryYears.dataEntryId, entry.id));

  const chartData = years
    .map((y) => ({ year: y.year, value: Number(y.value) || 0 }))
    .sort((a, b) => a.year.localeCompare(b.year));

  const mappedGoals = await db
    .select({
      id: goals.id,
      name: goals.name,
      score: indicatorGoalScores.score,
    })
    .from(indicatorGoalScores)
    .innerJoin(goals, eq(indicatorGoalScores.goalId, goals.id))
    .where(eq(indicatorGoalScores.indicatorId, entry.indicatorId));

  const unit = entry.departmentDesc || entry.subDepartment || entry.department;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/reports"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-muted-foreground">{entry.indicatorCode}</span>
            <Badge variant="secondary">{entry.group}</Badge>
            <Badge variant="secondary">{entry.subGroup}</Badge>
          </div>
          <h1 className="text-xl font-bold">{entry.indicatorName}</h1>
          {unit && <p className="text-muted-foreground text-sm mt-1">{unit}</p>}
        </div>

        <div className="flex gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground">
            Period: <strong className="text-foreground capitalize">{entry.periodType}</strong>
          </span>
          <span className="text-sm text-muted-foreground">
            Visibility: <strong className="text-foreground">{entry.visibility}</strong>
          </span>
          <span className="text-sm text-muted-foreground">
            Type: <strong className="text-foreground capitalize">{entry.valueType.replace("_", "/")}</strong>
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-semibold mb-4">Supported Strategic Goals</h2>
        {mappedGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No strategic goals are currently mapped to this indicator.</p>
        ) : (
          <div className="space-y-3">
            {mappedGoals.map((g) => (
              <div key={g.id} className="flex items-start gap-2">
                <span className="text-primary/50 mt-0.5">•</span>
                <span className="text-sm">{g.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-semibold mb-4">Data by Year</h2>
        <YearChart data={chartData} />

        {years.length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
            {chartData.map((y) => (
              <div key={y.year} className="text-center bg-muted rounded p-2">
                <div className="text-xs text-muted-foreground">{y.year}</div>
                <div className="font-semibold text-sm">{y.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
