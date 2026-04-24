import { db } from "@/db";
import { groups, subGroups } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import {
  createGroup, updateGroup, deleteGroup,
  createSubGroup, updateSubGroup, deleteSubGroup,
} from "@/app/actions/groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

type SP = { action?: string; id?: string; tab?: string };

export default async function AdminGroupsPage({ searchParams }: { searchParams: SP }) {
  const allGroups = await db.select().from(groups).orderBy(asc(groups.name));
  const allSubGroups = await db.select().from(subGroups).orderBy(asc(subGroups.name));

  const { action, id, tab = "groups" } = searchParams;
  const editingGroup = id && tab === "groups" ? allGroups.find((g) => g.id === id) : null;
  const editingSubGroup = id && tab === "subgroups" ? allSubGroups.find((s) => s.id === id) : null;

  const subsByGroup = (groupId: string) => allSubGroups.filter((s) => s.groupId === groupId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Groups & Sub-groups</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {allGroups.length} groups · {allSubGroups.length} sub-groups
          </p>
        </div>
        <div className="flex gap-2">
          {tab !== "subgroups" && !action && (
            <Button asChild variant="outline" size="sm">
              <Link href="?tab=subgroups&action=create">+ Sub-group</Link>
            </Button>
          )}
          {!action && (
            <Button asChild size="sm">
              <Link href="?tab=groups&action=create">+ Group</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Create / Edit Group form */}
      {tab === "groups" && (action === "create" || editingGroup) && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-md">
          <h2 className="font-semibold">{editingGroup ? "Edit Group" : "New Group"}</h2>
          <form
            action={editingGroup ? updateGroup.bind(null, editingGroup.id) : createGroup}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <Input name="name" defaultValue={editingGroup?.name} required />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button variant="ghost" asChild><Link href="/dashboard/admin/groups">Cancel</Link></Button>
            </div>
          </form>
        </div>
      )}

      {/* Create / Edit Sub-group form */}
      {tab === "subgroups" && (action === "create" || editingSubGroup) && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-md">
          <h2 className="font-semibold">{editingSubGroup ? "Edit Sub-group" : "New Sub-group"}</h2>
          <form
            action={editingSubGroup ? updateSubGroup.bind(null, editingSubGroup.id) : createSubGroup}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <Input name="name" defaultValue={editingSubGroup?.name} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Group</label>
              <select
                name="groupId"
                defaultValue={editingSubGroup?.groupId}
                required
                aria-label="Select group"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— select —</option>
                {allGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button variant="ghost" asChild><Link href="/dashboard/admin/groups">Cancel</Link></Button>
            </div>
          </form>
        </div>
      )}

      {/* Groups table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border font-medium text-sm">Groups</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-24">Sub-groups</TableHead>
              <TableHead className="w-40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allGroups.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{subsByGroup(g.id).length}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                        <Link href={`?tab=groups&action=edit&id=${g.id}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      <form action={async () => { "use server"; await deleteGroup(g.id); }}>
                        <Button variant="ghost" size="sm" type="submit" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </form>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Sub-groups table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border font-medium text-sm">Sub-groups</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Group</TableHead>
              <TableHead className="w-40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allSubGroups.map((s) => {
              const g = allGroups.find((g) => g.id === s.groupId);
              return (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{g?.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                        <Link href={`?tab=subgroups&action=edit&id=${s.id}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      <form action={async () => { "use server"; await deleteSubGroup(s.id); }}>
                        <Button variant="ghost" size="sm" type="submit" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
