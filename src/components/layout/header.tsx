import { auth, signOut } from "@/lib/auth";
import { LogOut } from "lucide-react";

const ROLE_LABELS: Record<number, string> = {
  1: "Read-only",
  2: "Member",
  3: "Editor",
  4: "Admin",
};

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {ROLE_LABELS[user.role ?? 2]}
              </p>
            </div>
            {user.image && (
              <img
                src={user.image}
                alt={user.name ?? ""}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </header>
  );
}
