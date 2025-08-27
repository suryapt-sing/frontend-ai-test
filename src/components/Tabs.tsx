"use client";

import React from "react";
import clsx from "clsx";

export function Tabs({
  tabs,
  initialId,
  children,
}: {
  tabs: { id: string; label: string }[];
  initialId: string;
  children: React.ReactNode;
}) {
  const [active, setActive] = React.useState(initialId);
  const panels = React.Children.toArray(children) as React.ReactElement[];
  const activePanel = panels.find(
    (child: any) => React.isValidElement(child) && child.props.id === active
  );
  return (
    <div className="w-full">
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="flex flex-wrap gap-2" aria-label="Tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              aria-current={active === t.id ? "page" : undefined}
              className={clsx(
                "px-3 py-1.5 text-sm rounded-lg",
                active === t.id
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
      <div>{activePanel}</div>
    </div>
  );
}

export function TabPanel({ id, children }: { id: string; children: React.ReactNode }) {
  return <div data-tab-panel-id={id}>{children}</div>;
}
