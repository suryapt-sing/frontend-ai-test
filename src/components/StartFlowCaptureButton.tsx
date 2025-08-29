"use client";

import { useEffect, useRef, useState } from "react";
import { startFlow } from "@/lib/api";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function StartFlowCaptureButton({
  flowId,
  projectId,
  label = "Start Flow Capture",
}: {
  flowId: string;
  projectId?: string;
  label?: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [ok, setOk] = useState<boolean | null>(null);
  const timerRef = useRef<number | null>(null);

  const kickOff = async () => {
    if (!flowId || !projectId) {
      toast({ title: "Missing IDs", description: "Project or flow id missing", variant: "destructive" });
      return;
    }
    setOpen(true);
    setBusy(true);
    setStatus("Queuing in backend…");
    setOk(null);
    try {
      const res = await startFlow({
        project_id: projectId,
        flow_id: flowId,
        screenshots: false,
        ask_descriptions: false,
      });
      setOk(Boolean(res?.ok));
      setStatus(res?.queued ? "Queued" : "Requested");
      toast({ title: "Flow queued", description: `Flow ${flowId} queued for project ${projectId}` });
    } catch (e: any) {
      setOk(false);
      setStatus(e?.message || "Failed");
      toast({ title: "Failed to start", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  // Lightweight fake progress animation while busy
  useEffect(() => {
    const bar = document.getElementById(`progress-bar-capture-${flowId}`);
    if (!bar) return;
    if (busy) {
      let w = 10;
      timerRef.current = window.setInterval(() => {
        w = Math.min(90, w + Math.random() * 10);
        bar.style.width = `${w}%`;
      }, 300);
    } else {
      bar.style.width = ok ? "100%" : bar.style.width || "0%";
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [busy, ok, flowId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="btn btn-primary" onClick={kickOff} disabled={busy || !projectId}>
          {label}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Starting Flow Capture</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm">
            <div>Project: <span className="font-mono">{projectId || "-"}</span></div>
            <div>Flow: <span className="font-mono">{flowId}</span></div>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded">
            <div id={`progress-bar-capture-${flowId}`} className="h-2 bg-brand-600 rounded transition-all" style={{ width: "10%" }} />
          </div>
          <div className="text-xs text-muted-foreground">{status}</div>
        </div>
        <DialogFooter>
          <button type="button" className="btn" onClick={() => setOpen(false)}>
            Stop Flow
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

