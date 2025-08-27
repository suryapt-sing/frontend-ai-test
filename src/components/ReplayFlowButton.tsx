"use client";

import { replayFlow } from "@/lib/api";
import { useState } from "react";

export default function ReplayFlowButton({
  flowId,
  projectId = "default.project",
}: {
  flowId: string;
  projectId?: string;
}) {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    try {
      setBusy(true);
      const res = await replayFlow(flowId, {
        project_id: projectId,
        flow_id_ext: flowId,
        server: "http://localhost:8124/sse",
      });
      if (res?.ok) alert("Replay queued.");
      else alert("Replay request sent.");
    } catch (e: any) {
      alert(`Replay failed: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className="btn btn-primary" onClick={onClick} disabled={busy}>
      {busy ? "Queuing…" : "Replay Flow"}
    </button>
  );
}
