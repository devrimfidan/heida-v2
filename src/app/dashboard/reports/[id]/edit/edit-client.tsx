"use client";

import { useState } from "react";
import { updateDataEntry } from "@/app/actions/data-entries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Department = { id: string; name: string };
type SubDepartment = { id: string; name: string; departmentId: string };
type Indicator = { id: string; code: string; name: string };

type Entry = {
  id: string;
  indicatorId: string;
  departmentId: string | null;
  subDepartmentId: string | null;
  departmentDesc: string | null;
  periodType: string;
  visibility: string;
};

type YearValue = { id?: string; year: string; value: string };

interface Props {
  entry: Entry;
  years: YearValue[];
  indicator: Indicator;
  departments: Department[];
  subDepartments: SubDepartment[];
}

export function EditDataEntryClient({
  entry,
  years,
  indicator,
  departments,
  subDepartments,
}: Props) {
  const [departmentId, setDepartmentId] = useState(entry.departmentId || "");
  const [subDeptId, setSubDeptId] = useState(entry.subDepartmentId || "");
  const [yearValues, setYearValues] = useState<YearValue[]>(
    years.length > 0 ? years.sort((a, b) => a.year.localeCompare(b.year)) : [{ year: "", value: "" }]
  );
  const [pending, setPending] = useState(false);

  const filteredSubDepts = subDepartments.filter(
    (s) => !departmentId || s.departmentId === departmentId
  );

  function addYear() {
    setYearValues((v) => [...v, { year: "", value: "" }]);
  }

  function removeYear(i: number) {
    setYearValues((v) => v.filter((_, idx) => idx !== i));
  }

  function updateYear(i: number, field: "year" | "value", val: string) {
    setYearValues((v) => v.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    await updateDataEntry(entry.id, formData);
    setPending(false);
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div>
        <p className="text-xs text-muted-foreground font-mono">{indicator.code}</p>
        <h2 className="font-semibold mt-0.5">{indicator.name}</h2>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <input type="hidden" name="indicatorId" value={entry.indicatorId} />

        {/* Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Department</label>
            <SelectNative
              name="departmentId"
              value={departmentId}
              onChange={(e) => { setDepartmentId(e.target.value); setSubDeptId(""); }}
            >
              <option value="">— select —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </SelectNative>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Sub-department</label>
            <SelectNative
              name="subDepartmentId"
              value={subDeptId}
              onChange={(e) => setSubDeptId(e.target.value)}
              disabled={!departmentId}
            >
              <option value="">— select —</option>
              {filteredSubDepts.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </SelectNative>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Unit name (free text, optional)</label>
          <Input name="departmentDesc" defaultValue={entry.departmentDesc || ""} placeholder="e.g. Computer Engineering Department" />
        </div>

        {/* Period + visibility */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Period type</label>
            <SelectNative name="periodType" defaultValue={entry.periodType}>
              <option value="calendar">Calendar Year</option>
              <option value="academic">Academic Year</option>
            </SelectNative>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Visibility</label>
            <SelectNative name="visibility" defaultValue={entry.visibility}>
              <option value="public">Public</option>
              <option value="staff_only">Staff Only</option>
              <option value="not_sure">Not Sure</option>
            </SelectNative>
          </div>
        </div>

        {/* Year-value pairs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Year / Value pairs</label>
            <Button type="button" variant="outline" size="sm" onClick={addYear}>
              <Plus className="w-3 h-3 mr-1" /> Add Year
            </Button>
          </div>
          {yearValues.map((row, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                name="year"
                placeholder="e.g. 2024"
                value={row.year}
                onChange={(e) => updateYear(i, "year", e.target.value)}
                className="w-36"
              />
              <Input
                name="value"
                placeholder="value"
                value={row.value}
                onChange={(e) => updateYear(i, "value", e.target.value)}
              />
              {yearValues.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeYear(i)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save Changes"}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/dashboard/reports">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
