"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx  from "clsx";
import { LayoutDashboard, Workflow, Play, BarChart3, FolderGit2, Settings, Circle, Database } from "lucide-react";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/flows", label: "Flows", icon: Workflow },
  { href: "/replays", label: "Replays", icon: Play },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/elements", label: "Elements DB", icon: Database },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3">
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="h-8 w-8 rounded-xl bg-brand-600" />
        <span className="font-semibold">QA Agent</span>
      </div>
      <nav className="mt-2 space-y-1">
        {items.map((it) => {
          const Icon = (it.icon as any) || Circle;
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link key={it.href} href={it.href} aria-current={active ? "page" : undefined} className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
              active ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200" : "hover:bg-gray-100 dark:hover:bg-gray-800"
            )}>
              <Icon size={18} />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-4 left-3 right-3 text-xs text-gray-400">v0.1</div>
    </aside>
  );
}
