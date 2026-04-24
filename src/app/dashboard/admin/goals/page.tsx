import { db } from "@/db";
import { goals, indicatorGoalScores } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { createGoal, updateGoal, deleteGoal } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortableTable } from "@/components/goals/sortable-table";
import Link from "next/link";

type SearchParams = { action?: string; id?: string };

export default async function AdminGoalsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const allGoals = await db.select().from(goals).orderBy(asc(goals.sortOrder));
  const mappings = await db.select().from(indicatorGoalScores);

  const goalRows = allGoals.map((g) => ({
    ...g,
    indicatorCount: mappings.filter((m) => m.goalId === g.id).length,
  }));

  const action = searchParams.action;
  const editId = searchParams.id;
  const editingGoal = editId ? allGoals.find((g) => g.id === editId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-muted-foreground">
            Manage the five strategic internationalization goals.
          </p>
        </div>
        {!action && (
          <Button asChild size="sm">
            <Link href="?action=create">+ New Goal</Link>
          </Button>
        )}
      </div>

      {action === "create" && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-md">
          <h2 className="text-lg font-semibold">Create Goal</h2>
          <form action={createGoal} className="space-y-4">

            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <Input name="name" required />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard/admin/goals">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      )}

      {action === "edit" && editingGoal && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-md">
          <h2 className="text-lg font-semibold">Edit Goal</h2>
          <form
            action={updateGoal.bind(null, editingGoal.id)}
            className="space-y-4"
          >

            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <Input name="name" defaultValue={editingGoal.name} required />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard/admin/goals">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="font-medium text-sm">Strategic Goals</span>
          <span className="text-xs text-muted-foreground">Drag rows to reorder</span>
        </div>
        <SortableTable
          rows={goalRows}
          onReorder={async (orderedIds) => {
            "use server";
            const { reorderGoals } = await import("@/app/actions/goals");
            await reorderGoals(orderedIds);
          }}
          onDelete={async (id) => {
            "use server";
            const { deleteGoal } = await import("@/app/actions/goals");
            await deleteGoal(id);
          }}
        />
      </div>
    </div>
  );
}
