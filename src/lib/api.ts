import { CreateFlowInput, CreateProductInput, Product, Flow } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const JSON_HEADERS = { "Content-Type": "application/json" };


async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

// --- KEEP your api<T>() helper as-is above ---

export const listFlows = () =>
  api<import("./types").FlowRow[]>("/api/flows");

// If project_id is undefined, backend returns ALL projects.
export const listRuns = (
  project_id?: string,
  status?: string,
  limit = 20,
  offset = 0
) => {
  const qs = new URLSearchParams();
  if (project_id) qs.set("project_id", project_id);
  if (status) qs.set("status", status);
  qs.set("limit", String(limit));
  qs.set("offset", String(offset));
  return api<import("./types").RunsResponse>(`/api/reports?${qs.toString()}`);
};

// Some pages need a single run’s summary or full report.
// These endpoints require project_id, but we’ll *only* call them
// when we know the project. (Replay detail will auto-discover.)
export const getRunSummary = (project_id: string, run_id_ext: string) =>
  api<any>(
    `/api/reports/${encodeURIComponent(project_id)}/${encodeURIComponent(
      run_id_ext
    )}/summary`
  );

export const getReportFull = (project_id: string, run_id_ext: string) =>
  api<any>(
    `/api/reports/${encodeURIComponent(project_id)}/${encodeURIComponent(
      run_id_ext
    )}`
  );

// (Optional) If you still use latestRun anywhere, require an explicit project:
export const latestRun = (project_id: string) =>
  api<import("./types").RunRow>(`/api/projects/${encodeURIComponent(project_id)}/latest`);

// Flow capture details
export const getFlow = (project_id: string, flow_id_ext: string) => {
  const qs = new URLSearchParams({ project_id });
  return api<import("./types").FlowCapture>(`/api/flows/${encodeURIComponent(flow_id_ext)}?${qs.toString()}`);
};

export const startFlow = (body: any) =>
  api<{ ok: boolean; queued: boolean }>(`/api/flows/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const replayFlow = (flow_id_ext: string, body: any) =>
  api<{ ok: boolean; queued: boolean }>(`/api/flows/${encodeURIComponent(flow_id_ext)}/replay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

