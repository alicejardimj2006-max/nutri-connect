import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Leaf, LogOut, Menu, X } from "lucide-react";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function DashboardShell({
  items,
  title,
  children,
  userName,
  userRole,
}: {
  items: NavItem[];
  title: string;
  children: ReactNode;
  userName: string;
  userRole: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen w-full bg-secondary/40">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <SidebarInner
          items={items}
          pathname={pathname}
          onNavigate={() => {}}
          onLogout={handleLogout}
          userName={userName}
          userRole={userRole}
        />
      </aside>

      {/* Sidebar mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar">
            <SidebarInner
              items={items}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
              onLogout={handleLogout}
              userName={userName}
              userRole={userRole}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background px-4 lg:px-8">
          <button
            className="rounded-md p-2 hover:bg-muted lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="truncate text-lg font-semibold">{title}</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight">{userName}</div>
              <div className="text-xs text-muted-foreground capitalize">{userRole}</div>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary-foreground">
              {userName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarInner({
  items,
  pathname,
  onNavigate,
  onLogout,
  userName,
  userRole,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate: () => void;
  onLogout: () => void;
  userName: string;
  userRole: string;
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between border-b px-5">
        <Link to="/" className="flex items-center gap-2" onClick={onNavigate}>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </span>
          <span className="font-bold">NutriConnect</span>
        </Link>
        <button className="rounded-md p-1 hover:bg-muted lg:hidden" onClick={onNavigate} aria-label="Fechar">
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="mb-2 px-2 py-1">
          <div className="truncate text-sm font-medium">{userName}</div>
          <div className="text-xs text-muted-foreground capitalize">{userRole}</div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
