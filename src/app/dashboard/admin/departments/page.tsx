import { db } from "@/db";
import { departments, subDepartments, DEPARTMENT_TYPES } from "@/db/schema";
import { asc } from "drizzle-orm";
import {
  createDepartment, updateDepartment, deleteDepartment,
  createSubDepartment, updateSubDepartment, deleteSubDepartment,
  reorderDepartments, reorderSubDepartments,
} from "@/app/actions/departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SortableTable, type DeptRow } from "@/components/departments/sortable-table";

type SP = { action?: string; id?: string; tab?: string };

export default async function AdminDepartmentsPage({ searchParams }: { searchParams: SP }) {
  const allDepts = await db.select().from(departments).orderBy(asc(departments.sortOrder));
  const allSubDepts = await db.select().from(subDepartments).orderBy(asc(subDepartments.sortOrder));

  const { action, id, tab = "departments" } = searchParams;
  const editingDept = id && tab === "departments" ? allDepts.find((d) => d.id === id) : null;
  const editingSubDept = id && tab === "subdepts" ? allSubDepts.find((s) => s.id === id) : null;

  const subsByDept = (deptId: string) => allSubDepts.filter((s) => s.departmentId === deptId);

  // Map rows for client component
  const deptRows: DeptRow[] = allDepts.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    type: d.type,
    website: d.website,
    sortOrder: d.sortOrder,
    subDeptCount: subsByDept(d.id).length,
  }));

  const subDeptRows: DeptRow[] = allSubDepts.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    type: s.type,
    website: s.website,
    sortOrder: s.sortOrder,
    parentName: allDepts.find((d) => d.id === s.departmentId)?.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Departments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {allDepts.length} departments · {allSubDepts.length} sub-departments
          </p>
        </div>
        <div className="flex gap-2">
          {!action && (
            <Button asChild variant="outline" size="sm">
              <Link href="?tab=subdepts&action=create">+ Sub-department</Link>
            </Button>
          )}
          {!action && (
            <Button asChild size="sm">
              <Link href="?tab=departments&action=create">+ Department</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Department form */}
      {tab === "departments" && (action === "create" || editingDept) && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-lg">
          <h2 className="font-semibold">{editingDept ? "Edit Department" : "New Department"}</h2>
          <form
            action={editingDept ? updateDepartment.bind(null, editingDept.id) : createDepartment}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium">Name</label>
                <Input name="name" defaultValue={editingDept?.name} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Code / Abbreviation</label>
                <Input name="code" defaultValue={editingDept?.code ?? ""} placeholder="e.g. FEN" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Type</label>
                <select
                  name="type"
                  defaultValue={editingDept?.type || "Other"}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {DEPARTMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Website</label>
                <Input name="website" type="url" defaultValue={editingDept?.website ?? ""} placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button variant="ghost" asChild><Link href="/dashboard/admin/departments">Cancel</Link></Button>
            </div>
          </form>
        </div>
      )}

      {/* Sub-department form */}
      {tab === "subdepts" && (action === "create" || editingSubDept) && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 max-w-lg">
          <h2 className="font-semibold">{editingSubDept ? "Edit Sub-department" : "New Sub-department"}</h2>
          <form
            action={editingSubDept ? updateSubDepartment.bind(null, editingSubDept.id) : createSubDepartment}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium">Name</label>
                <Input name="name" defaultValue={editingSubDept?.name} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Code / Abbreviation</label>
                <Input name="code" defaultValue={editingSubDept?.code ?? ""} placeholder="e.g. CSE" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Department</label>
              <select
                name="departmentId"
                defaultValue={editingSubDept?.departmentId}
                required
                aria-label="Select department"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— select —</option>
                {allDepts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Type</label>
                <select
                  name="type"
                  defaultValue={editingSubDept?.type || "Other"}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {DEPARTMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Website</label>
                <Input name="website" type="url" defaultValue={editingSubDept?.website ?? ""} placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button variant="ghost" asChild><Link href="/dashboard/admin/departments">Cancel</Link></Button>
            </div>
          </form>
        </div>
      )}

      {/* Departments sortable table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="font-medium text-sm">Departments</span>
          <span className="text-xs text-muted-foreground">Drag rows to reorder</span>
        </div>
        <SortableTable
          rows={deptRows}
          kind="departments"
          onReorder={reorderDepartments}
          onDelete={deleteDepartment}
        />
      </div>

      {/* Sub-departments sortable table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="font-medium text-sm">Sub-departments</span>
          <span className="text-xs text-muted-foreground">Drag rows to reorder</span>
        </div>
        <SortableTable
          rows={subDeptRows}
          kind="subdepts"
          onReorder={reorderSubDepartments}
          onDelete={deleteSubDepartment}
        />
      </div>
    </div>
  );
}
