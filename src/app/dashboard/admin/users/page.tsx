import { db } from "@/db";
import { users } from "@/db/schema";
import { asc } from "drizzle-orm";
import { updateUserRole } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ROLE_LABELS: Record<number, string> = {
  1: "Read-only",
  2: "Member",
  3: "Editor",
  4: "Admin",
};

const ROLE_VARIANTS: Record<number, "default" | "secondary" | "destructive"> = {
  1: "secondary",
  2: "secondary",
  3: "default",
  4: "destructive",
};

export default async function AdminUsersPage() {
  const allUsers = await db.select().from(users).orderBy(asc(users.name));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">{allUsers.length} registered users</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-32">Current Role</TableHead>
              <TableHead className="w-64">Change Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                  No users yet.
                </TableCell>
              </TableRow>
            )}
            {allUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANTS[user.role ?? 2]}>
                    {ROLE_LABELS[user.role ?? 2]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <form
                    action={updateUserRole.bind(null, user.id)}
                    className="flex gap-2 items-center"
                  >
                    <select
                      name="role"
                      defaultValue={user.role ?? 2}
                      aria-label="Select role"
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value={1}>Read-only</option>
                      <option value={2}>Member</option>
                      <option value={3}>Editor</option>
                      <option value={4}>Admin</option>
                    </select>
                    <Button type="submit" size="sm" variant="outline">Save</Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
