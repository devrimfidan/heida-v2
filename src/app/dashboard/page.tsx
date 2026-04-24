import { db } from "@/db";
import { users, departments, dataEntries } from "@/db/schema";
import { sql } from "drizzle-orm";
import { Users, Building2, ClipboardList, TrendingUp } from "lucide-react";

async function getStats() {
  const [userCount, deptCount, entryCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(departments),
    db.select({ count: sql<number>`count(*)` }).from(dataEntries),
  ]);
  return {
    users: Number(userCount[0].count),
    departments: Number(deptCount[0].count),
    entries: Number(entryCount[0].count),
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Internationalization data at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Users"
          value={stats.users}
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <StatCard
          label="Departments"
          value={stats.departments}
          icon={<Building2 className="w-5 h-5 text-primary" />}
        />
        <StatCard
          label="Data Entries"
          value={stats.entries}
          icon={<ClipboardList className="w-5 h-5 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickLink
          href="/dashboard/data"
          title="Enter Data"
          description="Submit internationalization indicator values for your unit"
          icon={<ClipboardList className="w-6 h-6 text-primary" />}
        />
        <QuickLink
          href="/dashboard/reports"
          title="View Reports"
          description="Browse and visualize submitted data across all units"
          icon={<TrendingUp className="w-6 h-6 text-primary" />}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
      <div className="p-2 bg-primary/10 rounded-md">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="bg-card border border-border rounded-lg p-5 flex items-start gap-4 hover:border-primary/50 transition-colors group"
    >
      <div className="p-2 bg-primary/10 rounded-md shrink-0">{icon}</div>
      <div>
        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </a>
  );
}
