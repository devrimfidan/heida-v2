"use client";

import { useRef, useState, useTransition } from "react";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export interface GoalRow {
  id: string;
  name: string;
  sortOrder: number;
  indicatorCount?: number;
}

interface Props {
  rows: GoalRow[];
  onReorder: (orderedIds: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function SortableTable({ rows, onReorder, onDelete }: Props) {
  const [items, setItems] = useState(rows);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const dragNode = useRef<HTMLTableRowElement | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    dragNode.current = e.currentTarget as HTMLTableRowElement;
    e.dataTransfer.effectAllowed = "move";
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
            <th className="w-16 text-center px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Order
            </th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Name
            </th>
            <th className="text-center px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider w-28">
              Indicators
            </th>
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
              <td className="px-4 py-2.5 text-center text-muted-foreground font-mono">
                {index + 1}
              </td>
              <td className="px-4 py-2.5 font-medium text-foreground">
                {row.name}
              </td>
              <td className="px-4 py-2.5 text-center">
                <Badge variant="secondary">{row.indicatorCount ?? 0}</Badge>
              </td>
              <td className="px-4 py-2.5 text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                    <Link href={`?action=edit&id=${row.id}`}>
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
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                No goals yet. Create one above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
