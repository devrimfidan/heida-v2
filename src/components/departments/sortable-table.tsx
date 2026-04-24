"use client";

import { useRef, useState, useTransition } from "react";
import { GripVertical, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

/* ─── Types ───────────────────────────────────────────────────────── */
export interface DeptRow {
  id: string;
  name: string;
  code: string | null;
  type: string | null;
  website: string | null;
  sortOrder: number;
  subDeptCount?: number;
  parentName?: string;
}

interface Props {
  rows: DeptRow[];
  kind: "departments" | "subdepts";
  onReorder: (orderedIds: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

/* ─── Component ───────────────────────────────────────────────────── */
export function SortableTable({ rows, kind, onReorder, onDelete }: Props) {
  const [items, setItems] = useState(rows);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const dragNode = useRef<HTMLTableRowElement | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    dragNode.current = e.currentTarget as HTMLTableRowElement;
    e.dataTransfer.effectAllowed = "move";
    // Make the row slightly transparent during drag
    requestAnimationFrame(() => {
      if (dragNode.current) dragNode.current.style.opacity = "0.4";
    });
  };

  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = "1";
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      const reordered = [...items];
      const [moved] = reordered.splice(dragIndex, 1);
      reordered.splice(overIndex, 0, moved);
      setItems(reordered);
      startTransition(() => {
        onReorder(reordered.map((r) => r.id));
      });
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIndex(index);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
    startTransition(() => {
      onDelete(id);
    });
  };

  return (
    <div className={`transition-opacity ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="w-10 px-2 py-2.5" />
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Name
            </th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-24">
              Code
            </th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Type
            </th>
            {kind === "departments" && (
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-28">
                Sub-depts
              </th>
            )}
            {kind === "subdepts" && (
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Department
              </th>
            )}
            <th className="w-32 px-4 py-2.5 text-right font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, index) => (
            <tr
              key={row.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              className={`
                border-b border-border transition-colors cursor-grab active:cursor-grabbing
                ${overIndex === index && dragIndex !== null && dragIndex !== index
                  ? "bg-primary/5 border-primary/30"
                  : "hover:bg-muted/30"
                }
              `}
            >
              <td className="px-2 py-2.5 text-muted-foreground">
                <GripVertical className="w-4 h-4 mx-auto" />
              </td>
              <td className="px-4 py-2.5 font-medium text-foreground">
                <div className="flex items-center gap-2">
                  {row.name}
                  {row.website && (
                    <a
                      href={row.website.startsWith("http") ? row.website : `https://${row.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title={row.website}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </td>
              <td className="px-4 py-2.5">
                {row.code ? (
                  <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{row.code}</code>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-2.5">
                {row.type && row.type !== "Other" ? (
                  <Badge variant="secondary" className="font-normal text-xs">
                    {row.type}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </td>
              {kind === "departments" && (
                <td className="px-4 py-2.5">
                  <Badge variant="secondary">{row.subDeptCount ?? 0}</Badge>
                </td>
              )}
              {kind === "subdepts" && (
                <td className="px-4 py-2.5 text-muted-foreground text-sm">
                  {row.parentName}
                </td>
              )}
              <td className="px-4 py-2.5 text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                    <Link href={`?tab=${kind}&action=edit&id=${row.id}`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(row.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={kind === "departments" ? 7 : 7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                No {kind === "departments" ? "departments" : "sub-departments"} yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
