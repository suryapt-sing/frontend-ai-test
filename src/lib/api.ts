import type { Project, CreateProjectInput, Flow, CreateFlowInput } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const BASE_CAPTURE_URL = "http://localhost:8000";

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

export const startFlow = async (body: any) => {
  const res = await fetch(`${BASE_CAPTURE_URL}/api/flows/start`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<{ ok: boolean; queued: boolean }>;
}

export const replayFlow = (flow_id_ext: string, body: any) =>
  api<{ ok: boolean; queued: boolean }>(`/api/flows/${encodeURIComponent(flow_id_ext)}/replay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });


// lib/api.ts

// const JSON_HEADERS = { "Content-Type": "application/json" } as const;

// /**
//  * Always call our own Next.js API routes (acts as a proxy to your real backend).
//  * Works both in the browser and on the server. Disables caching by default.
//  */
// async function api<T>(path: string, init?: RequestInit): Promise<T> {
//   const res = await fetch(path, { cache: "no-store", ...init });
//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     throw new Error(`API ${res.status}: ${text || res.statusText}`);
//   }
//   return res.json() as Promise<T>;
// }

/** ---------- Reports / Runs (proxied via /api/...) ---------- */

// export const listRuns = (
//   project_id?: string,
//   status?: string,
//   limit = 20,
//   offset = 0
// ) => {
//   const qs = new URLSearchParams();
//   if (project_id) qs.set("project_id", project_id);
//   if (status) qs.set("status", status);
//   qs.set("limit", String(limit));
//   qs.set("offset", String(offset));
//   return api<import("./types").RunsResponse>(`/api/reports?${qs}`);
// };

// export const getRunSummary = (project_id: string, run_id_ext: string) =>
//   api<any>(`/api/reports/${encodeURIComponent(project_id)}/${encodeURIComponent(run_id_ext)}/summary`);

// export const getReportFull = (project_id: string, run_id_ext: string) =>
//   api<any>(`/api/reports/${encodeURIComponent(project_id)}/${encodeURIComponent(run_id_ext)}`);

/** ---------- Projects ---------- */

export async function listProjects(): Promise<Project[]> {
  return api<Project[]>("/api/projects");
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  return api<Project>("/api/projects", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export async function checkProjectLabelUnique(project_label: string): Promise<boolean> {
  const env = typeof window === "undefined" ? "server" : "client";
  const url = `${BASE}/api/projects?project_label=${encodeURIComponent(project_label)}`;

  console.log(`[checkProjectLabelUnique] (${env}) GET ${url}`);

  try {
    const res = await fetch(url, { cache: "no-store" });
    console.log(`[checkProjectLabelUnique] (${env}) status=${res.status}`);

    if (!res.ok) return false;
    const data = await res.json().catch(() => ({} as any));
    console.log(`[checkProjectLabelUnique] (${env}) data=`, data);

    return data.length < 1;
  } catch (err) {
    console.error(`[checkProjectLabelUnique] (${env}) fetch failed:`, err);
    return false;
  }
}

/** ---------- Flows ---------- */

// export async function listFlows(): Promise<Flow[]> {
//   return api<Flow[]>("/api/flows");
// }

// change in normal featch apis or use axios
// use base url 
export async function createFlow(input: CreateFlowInput): Promise<Flow> {
  const res = await fetch(`${BASE}/api/flows`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<Flow>;
}

// export const getFlow = (project_id: string, flow_id_ext: string) => {
//   const qs = new URLSearchParams({ project_id });
//   return api<import("./types").FlowCapture>(`/api/flows/${encodeURIComponent(flow_id_ext)}?${qs}`);
// };

// export const startFlow = (body: any) =>
//   api<{ ok: boolean; queued: boolean }>("/api/flows/start", {
//     method: "POST",
//     headers: JSON_HEADERS,
//     body: JSON.stringify(body),
//   });

// export const replayFlow = (flow_id_ext: string, body: any) =>
//   api<{ ok: boolean; queued: boolean }>(`/api/flows/${encodeURIComponent(flow_id_ext)}/replay`, {
//     method: "POST",
//     headers: JSON_HEADERS,
//     body: JSON.stringify(body),
//   });
