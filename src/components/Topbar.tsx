"use client";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/70 px-4 py-2 backdrop-blur dark:border-gray-800 dark:bg-gray-950/60">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">QA Agent</div>
      <form action="/replays" className="flex items-center gap-2">
        <input
          name="q"
          placeholder="Search runs, URLs, status…"
          className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
        />
        <button className="btn" type="submit">Search</button>
      </form>
    </header>
  );
}
