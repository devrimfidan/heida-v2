import { db } from "@/db";
import { indicators, subGroups, groups, indicatorGoalScores, goals } from "@/db/schema";
import { asc, eq, inArray } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

const VALUE_TYPE_LABELS: Record<string, string> = {
  yes_no: "Yes/No",
  numeric: "Numeric",
  percentage: "Percentage",
};

const VISIBILITY_VARIANTS: Record<string, "default" | "secondary" | "destructive"> = {
  public: "default",
  staff_only: "secondary",
  not_sure: "destructive",
};

export default async function IndicatorsPage({
  searchParams,
}: {
  searchParams: { q?: string; group?: string; goal?: string; type?: string; visibility?: string };
}) {
  const allGroups = await db.select().from(groups).orderBy(asc(groups.name));
  const allSubGroups = await db.select().from(subGroups).orderBy(asc(subGroups.name));
  const allGoals = await db.select().from(goals).orderBy(asc(goals.sortOrder));

  const rows = await db
    .select({
      id: indicators.id,
      code: indicators.code,
      name: indicators.name,
      valueType: indicators.valueType,
      visibility: indicators.visibility,
      subGroupName: subGroups.name,
      groupId: groups.id,
      groupName: groups.name,
    })
    .from(indicators)
    .innerJoin(subGroups, eq(indicators.subGroupId, subGroups.id))
    .innerJoin(groups, eq(subGroups.groupId, groups.id))
    .orderBy(asc(indicators.code));

  // Fetch all goal mappings
  const goalMappings = await db
    .select({
      indicatorId: indicatorGoalScores.indicatorId,
      goalId: goals.id,
      goalName: goals.name,
    })
    .from(indicatorGoalScores)
    .innerJoin(goals, eq(indicatorGoalScores.goalId, goals.id));

  const goalsByIndicator = goalMappings.reduce((acc, curr) => {
    if (!acc[curr.indicatorId]) acc[curr.indicatorId] = [];
    acc[curr.indicatorId].push({ id: curr.goalId, name: curr.goalName });
    return acc;
  }, {} as Record<string, { id: string; name: string }[]>);

  const filtered = rows.filter((r) => {
    if (searchParams.group && r.groupId !== searchParams.group) return false;
    if (searchParams.type && r.valueType !== searchParams.type) return false;
    if (searchParams.visibility && r.visibility !== searchParams.visibility) return false;
    if (searchParams.goal) {
      const linkedGoals = goalsByIndicator[r.id] || [];
      if (!linkedGoals.some(g => g.id === searchParams.goal)) return false;
    }
    if (searchParams.q) {
      const q = searchParams.q.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Indicators</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} of {rows.length} indicators
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Filter Indicators
        </h2>
        <form className="grid grid-cols-12 gap-4">
          <div className="space-y-1 col-span-12 sm:col-span-6 lg:col-span-4">
            <label className="text-sm font-medium">Search</label>
            <input
              name="q"
              defaultValue={searchParams.q}
              placeholder="Code or name…"
              className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1 col-span-12 sm:col-span-6 lg:col-span-4">
            <label className="text-sm font-medium">Group</label>
            <select
              name="group"
              defaultValue={searchParams.group}
              aria-label="Filter by group"
              className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All groups</option>
              {allGroups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 col-span-12 sm:col-span-6 lg:col-span-4">
            <label className="text-sm font-medium">Goal</label>
            <select
              name="goal"
              defaultValue={searchParams.goal}
              aria-label="Filter by goal"
              className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All goals</option>
              {allGoals.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 col-span-12 sm:col-span-6 lg:col-span-4">
            <label className="text-sm font-medium">Type</label>
            <select
              name="type"
              defaultValue={searchParams.type}
              aria-label="Filter by type"
              className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All types</option>
              {Object.entries(VALUE_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 col-span-12 sm:col-span-6 lg:col-span-4">
            <label className="text-sm font-medium">Visibility</label>
            <select
              name="visibility"
              defaultValue={searchParams.visibility}
              aria-label="Filter by visibility"
              className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All visibility</option>
              <option value="public">Public</option>
              <option value="staff_only">Staff Only</option>
              <option value="not_sure">Not Sure</option>
            </select>
          </div>
          <div className="space-y-1 flex items-end justify-end gap-2 col-span-12 lg:col-span-3 lg:col-start-10">
            <Button type="submit" variant="outline" className="flex-1 lg:flex-none">Filter</Button>
            {(searchParams.q || searchParams.group || searchParams.goal || searchParams.type || searchParams.visibility) && (
              <Button variant="ghost" className="flex-1 lg:flex-none" asChild>
                <Link href="/dashboard/indicators">Clear</Link>
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Code</TableHead>
              <TableHead>Indicator Name</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Sub-group</TableHead>
              <TableHead className="w-28">Type</TableHead>
              <TableHead className="w-28">Visibility</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  No indicators match the current filter.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((ind) => (
              <TableRow key={ind.id}>
                <TableCell className="font-mono text-xs">{ind.code}</TableCell>
                <TableCell className="text-sm">{ind.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{ind.groupName}</TableCell>
                <TableCell className="text-sm">{ind.subGroupName}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{VALUE_TYPE_LABELS[ind.valueType] ?? ind.valueType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={VISIBILITY_VARIANTS[ind.visibility] ?? "secondary"}>
                    {ind.visibility.replace("_", " ")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
