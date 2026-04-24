"use client";

import { useState } from "react";
import { createDataEntry } from "@/app/actions/data-entries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, ChevronRight } from "lucide-react";


type Group = { id: string; name: string };
type SubGroup = { id: string; name: string; groupId: string };
type Indicator = { id: string; code: string; name: string; valueType: string; subGroupId: string };
type Department = { id: string; name: string };
type SubDepartment = { id: string; name: string; departmentId: string };

interface Props {
  groups: Group[];
  subGroups: SubGroup[];
  indicators: Indicator[];
  departments: Department[];
  subDepartments: SubDepartment[];
}

type YearValue = { year: string; value: string };

const VALUE_TYPE_LABELS: Record<string, string> = {
  yes_no: "Yes/No",
  numeric: "Numeric",
  percentage: "Percentage",
};

export function DataEntryClient({
  groups,
  subGroups,
  indicators,
  departments,
  subDepartments,
}: Props) {
  const [groupId, setGroupId] = useState("");
  const [subGroupId, setSubGroupId] = useState("");
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [departmentId, setDepartmentId] = useState("");
  const [subDeptId, setSubDeptId] = useState("");
  const [yearValues, setYearValues] = useState<YearValue[]>([{ year: "", value: "" }]);
  const [pending, setPending] = useState(false);

  const filteredGroups = groupId
    ? groups.filter((g) => g.id === groupId)
    : groups;

  const filteredSubGroups = groupId
    ? subGroups.filter((s) => s.groupId === groupId)
    : subGroupId
    ? subGroups.filter((s) => s.id === subGroupId)
    : subGroups;

  const filteredIndicators = indicators.filter((ind) => {
    if (subGroupId && ind.subGroupId !== subGroupId) return false;
    if (groupId && !subGroupId) {
      const subs = subGroups.filter((s) => s.groupId === groupId).map((s) => s.id);
      if (!subs.includes(ind.subGroupId)) return false;
    }
    return true;
  });

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

  function resetForm() {
    setSelectedIndicator(null);
    setDepartmentId("");
    setSubDeptId("");
    setYearValues([{ year: "", value: "" }]);
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    await createDataEntry(formData);
    setPending(false);
    resetForm();
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Filter Indicators
        </h2>
        <div className="grid grid-cols-12 gap-4">
          <div className="space-y-1 col-span-12 sm:col-span-5 lg:col-span-4">
            <label className="text-sm font-medium">Group</label>
            <SelectNative
              value={groupId}
              onChange={(e) => { setGroupId(e.target.value); setSubGroupId(""); setSelectedIndicator(null); }}
            >
              <option value="">All groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </SelectNative>
          </div>
          <div className="space-y-1 col-span-12 sm:col-span-5 lg:col-span-4">
            <label className="text-sm font-medium">Sub-group</label>
            <SelectNative
              value={subGroupId}
              onChange={(e) => { setSubGroupId(e.target.value); setSelectedIndicator(null); }}
              disabled={!groupId}
            >
              <option value="">All sub-groups</option>
              {subGroups
                .filter((s) => !groupId || s.groupId === groupId)
                .map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </SelectNative>
          </div>
          <div className="space-y-1 flex items-end justify-end col-span-12 lg:col-span-2 lg:col-start-11">
            <Button
              variant="outline"
              onClick={() => { setGoalId(""); setGroupId(""); setSubGroupId(""); setSelectedIndicator(null); }}
              className="w-full"
            >
              Reset filters
            </Button>
          </div>
        </div>
      </div>

      {/* Indicator table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="font-medium text-sm">
            {filteredIndicators.length} indicator{filteredIndicators.length !== 1 ? "s" : ""}
            {(groupId || subGroupId) ? " (filtered)" : ""}
          </span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Code</TableHead>
                <TableHead>Indicator</TableHead>
                <TableHead className="w-28">Type</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIndicators.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No indicators match the current filter.
                  </TableCell>
                </TableRow>
              )}
              {filteredIndicators.map((ind) => (
                <TableRow
                  key={ind.id}
                  className={selectedIndicator?.id === ind.id ? "bg-primary/5" : "cursor-pointer"}
                  onClick={() => setSelectedIndicator(ind.id === selectedIndicator?.id ? null : ind)}
                >
                  <TableCell className="font-mono text-xs">{ind.code}</TableCell>
                  <TableCell className="text-sm">{ind.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{VALUE_TYPE_LABELS[ind.valueType] ?? ind.valueType}</Badge>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${selectedIndicator?.id === ind.id ? "rotate-90" : ""}`} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Inline entry form */}
      {selectedIndicator && (
        <div className="bg-card border border-primary/30 rounded-lg p-6 space-y-5">
          <div>
            <p className="text-xs text-muted-foreground font-mono">{selectedIndicator.code}</p>
            <h2 className="font-semibold mt-0.5">{selectedIndicator.name}</h2>
          </div>

          <form action={handleSubmit} className="space-y-5">
            <input type="hidden" name="indicatorId" value={selectedIndicator.id} />

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
              <Input name="departmentDesc" placeholder="e.g. Computer Engineering Department" />
            </div>

            {/* Period + visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Period type</label>
                <SelectNative name="periodType" defaultValue="calendar">
                  <option value="calendar">Calendar Year</option>
                  <option value="academic">Academic Year</option>
                </SelectNative>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Visibility</label>
                <SelectNative name="visibility" defaultValue="public">
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

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save Entry"}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
