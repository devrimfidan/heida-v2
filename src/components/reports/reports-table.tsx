"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart2, Pencil, Trash2, ArrowUpDown, Eye, EyeOff, AlertTriangle, X } from "lucide-react";
import { deleteDataEntry } from "@/app/actions/data-entries";

const VISIBILITY_LABELS: Record<string, string> = {
  public: "Public",
  staff_only: "Staff Only",
  not_sure: "Not Sure",
};

export type ReportEntry = {
  id: string;
  indicatorCode: string;
  indicatorName: string;
  group: string;
  subGroup: string;
  department: string | null;
  subDepartment: string | null;
  departmentDesc: string | null;
  periodType: string;
  visibility: string;
  createdAt: Date;
};

interface Props {
  entries: ReportEntry[];
}

type SortConfig = {
  key: keyof ReportEntry;
  direction: "asc" | "desc";
} | null;

export function ReportsTable({ entries }: Props) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    code: true,
    indicator: true,
    group: true,
    unit: false,
    period: false,
    visibility: false,
    actions: true,
  });

  const [isColMenuOpen, setIsColMenuOpen] = useState(false);
  const [showTip, setShowTip] = useState(true);

  const sortedEntries = [...entries].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    let aVal = a[key] ?? "";
    let bVal = b[key] ?? "";

    if (key === "group") {
      aVal = a.group + a.subGroup;
      bVal = b.group + b.subGroup;
    } else if (key === "department") {
      aVal = a.departmentDesc || a.subDepartment || a.department || "";
      bVal = b.departmentDesc || b.subDepartment || b.department || "";
    }

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key: keyof ReportEntry | "group" | "department") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: key as keyof ReportEntry, direction });
  };

  const toggleCol = (col: string) => {
    setVisibleCols((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  const SortIcon = () => <ArrowUpDown className="w-3 h-3 ml-1 inline text-muted-foreground" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          {showTip && (
            <div className="text-sm bg-amber-500/15 text-amber-700 dark:text-amber-500 px-3 py-1.5 rounded-md flex items-center gap-2 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
              <span><strong>Note:</strong> There are hidden columns. You can use the <strong>Columns</strong> menu to show them.</span>
              <button onClick={() => setShowTip(false)} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <Button variant="outline" size="sm" onClick={() => setIsColMenuOpen(!isColMenuOpen)}>
            {isColMenuOpen ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            Columns
          </Button>
          {isColMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg p-2 z-10 flex flex-col gap-1">
              {Object.entries(visibleCols).map(([key, isVisible]) => (
                <label key={key} className="flex items-center gap-2 text-sm p-1 hover:bg-muted/50 rounded cursor-pointer capitalize">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => toggleCol(key)}
                    className="rounded border-input"
                    disabled={key === "actions"} // prevent hiding actions
                  />
                  {key}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleCols.code && (
                  <TableHead className="w-28 cursor-pointer select-none" onClick={() => requestSort("indicatorCode")}>
                    Code <SortIcon />
                  </TableHead>
                )}
                {visibleCols.indicator && (
                  <TableHead className="cursor-pointer select-none" onClick={() => requestSort("indicatorName")}>
                    Indicator <SortIcon />
                  </TableHead>
                )}
                {visibleCols.group && (
                  <TableHead className="cursor-pointer select-none" onClick={() => requestSort("group")}>
                    Group <SortIcon />
                  </TableHead>
                )}
                {visibleCols.unit && (
                  <TableHead className="cursor-pointer select-none" onClick={() => requestSort("department")}>
                    Unit <SortIcon />
                  </TableHead>
                )}
                {visibleCols.period && (
                  <TableHead className="w-24 cursor-pointer select-none" onClick={() => requestSort("periodType")}>
                    Period <SortIcon />
                  </TableHead>
                )}
                {visibleCols.visibility && (
                  <TableHead className="w-28 cursor-pointer select-none" onClick={() => requestSort("visibility")}>
                    Visibility <SortIcon />
                  </TableHead>
                )}
                {visibleCols.actions && (
                  <TableHead className="w-28 text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    No data entries yet.{" "}
                    <Link href="/dashboard/data" className="text-primary underline">
                      Add the first one.
                    </Link>
                  </TableCell>
                </TableRow>
              )}
              {sortedEntries.map((entry) => (
                <TableRow key={entry.id}>
                  {visibleCols.code && (
                    <TableCell className="font-mono text-xs">{entry.indicatorCode}</TableCell>
                  )}
                  {visibleCols.indicator && (
                    <TableCell className="text-sm">{entry.indicatorName}</TableCell>
                  )}
                  {visibleCols.group && (
                    <TableCell className="text-sm">
                      <span className="text-muted-foreground">{entry.group} /</span>{" "}
                      {entry.subGroup}
                    </TableCell>
                  )}
                  {visibleCols.unit && (
                    <TableCell className="text-sm">
                      {entry.departmentDesc || entry.subDepartment || entry.department || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                  {visibleCols.period && (
                    <TableCell>
                      <Badge variant="secondary">
                        {entry.periodType === "academic" ? "Academic" : "Calendar"}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleCols.visibility && (
                    <TableCell>
                      <Badge variant={entry.visibility === "public" ? "default" : "secondary"}>
                        {VISIBILITY_LABELS[entry.visibility] ?? entry.visibility}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleCols.actions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/reports/${entry.id}`}>
                            <BarChart2 className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/reports/${entry.id}/edit`}>
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </Button>
                        <form
                          action={async () => {
                            await deleteDataEntry(entry.id);
                          }}
                        >
                          <Button variant="ghost" size="sm" type="submit" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
