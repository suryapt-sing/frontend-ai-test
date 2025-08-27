"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function ProjectHealthDonut({ latest }: { latest: any | null }) {
  const data = useMemo(() => {
    const passed = latest?.passed ?? 0;
    const total = latest?.total ?? 0;
    const failed = Math.max(0, total - passed);
    return [
      { name: "Passed", value: passed, color: "#16a34a" },
      { name: "Failed", value: failed, color: "#dc2626" },
    ];
  }, [latest]);

  const sum = data.reduce((a, b) => a + (b.value || 0), 0);
  if (!sum) {
    return <div className="text-sm text-gray-500">No data yet.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={60}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(val: any, name: any) => [val, name]} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function PassRateTrend({ runs }: { runs: any | null }) {
  const data = useMemo(() => {
    const items = runs?.items || [];
    return items
      .slice()
      .reverse()
      .map((r: any) => ({
        when: new Date(r.created_at).toLocaleDateString(),
        rate: r.total ? Math.round((r.passed / r.total) * 100) : 0,
      }));
  }, [runs]);

  if (!data.length) {
    return <div className="text-sm text-gray-500">No runs to chart yet.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis dataKey="when" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v: any) => [`${v}%`, "Pass rate"]} />
        <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
