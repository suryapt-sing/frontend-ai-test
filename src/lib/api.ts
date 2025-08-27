const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const listFlows = () => api<import("./types").FlowRow[]>("/api/flows");

export const listRuns = (project_id?: string, status?: string, limit = 20, offset = 0) => {
  const qs = new URLSearchParams();
  if (project_id) qs.set("project_id", project_id);
  if (status) qs.set("status", status);
  qs.set("limit", String(limit));
  qs.set("offset", String(offset));
  return api<import("./types").RunsResponse>(`/api/reports?${qs.toString()}`);
};

export const latestRun = (project_id: string) => api<import("./types").RunRow>(`/api/projects/${project_id}/latest`);

export const startFlow = (body: any) => api<{ ok: boolean; queued: boolean }>(`/api/flows/start`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});

export const replayFlow = (flow_id_ext: string, body: any) => api<{ ok: boolean; queued: boolean }>(`/api/flows/${flow_id_ext}/replay`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});

// GET /api/flows/{flow_id_ext}?project_id=...
export const getFlow = (project_id: string, flow_id_ext: string) => {
  const qs = new URLSearchParams({ project_id });
  return api<import("./types").FlowCapture>(`/api/flows/${encodeURIComponent(flow_id_ext)}?${qs.toString()}`);
};