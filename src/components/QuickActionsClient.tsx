"use client";

import { startFlow } from "@/lib/api";
import { useState } from "react";

export default function QuickActionsClient() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const handleStart = async () => {
    if (!url) return alert("Enter a start URL");
    try {
      setBusy(true);
      await startFlow({
        url,
        out: "ui_capture.json",
        project: "default.project",
        server: "http://localhost:8124/sse",
        screenshots: false,
        ask_descriptions: false,
      });
      alert("Flow queued! Check Replays shortly.");
      setUrl("");
    } catch (e: any) {
      alert(`Failed: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Start URL"
        className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 px-3 py-2"
      />
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleStart}
        disabled={busy}
      >
        {busy ? "Queuing…" : "Start Flow"}
      </button>
      <a href="/replays" className="btn">View Replays</a>
      <a href="/flows" className="btn">Manage Flows</a>
    </div>
  );
}
