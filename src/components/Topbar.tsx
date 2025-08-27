"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/70 backdrop-blur">
      <div className="container-app h-14 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">Project:</span>
          <select className="rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-1.5">
            <option>default.project</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input placeholder="Search…" className="hidden md:block rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-1.5 text-sm" />
          <button className="btn" onClick={toggle}>{theme === "dark" ? <Sun size={16}/> : <Moon size={16}/>}</button>
        </div>
      </div>
    </header>
  );
}
