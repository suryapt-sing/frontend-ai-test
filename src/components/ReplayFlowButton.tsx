"use client";

import { replayFlow } from "@/lib/api";

export default function ReplayFlowButton({ flowId }: { flowId: string }) {
  const onClick = async () => {
    try {
      const res = await replayFlow(flowId, {});
      if (res?.ok) alert("Replay queued.");
      else alert("Replay request sent.");
    } catch (e: any) {
      alert(`Replay failed: ${e?.message || e}`);
    }
  };
  return (
    <button className="btn btn-primary" onClick={onClick}>Replay Flow</button>
  );
}
