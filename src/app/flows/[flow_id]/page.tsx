import { listFlows, listRuns, getFlow } from "@/lib/api";
import ReplayFlowButton from "@/components/ReplayFlowButton";
import { Tabs, TabPanel } from "@/components/Tabs";
import { StatusBadge } from "@/components/StatusBadge";

export default async function Page({
  params,
  searchParams,
}: {
  params: { flow_id: string };
  searchParams: { project?: string };
}) {
  const flowId = decodeURIComponent(params.flow_id);
  const projectFromUrl = searchParams.project;

  // try to infer project if not in query
  let flows: any[] = [];
  try { flows = await listFlows(); } catch {}
  const meta = flows.find((f) => f.flow_id_ext === flowId) || null;
  const projectId = projectFromUrl || meta?.project_id || "default.project";

  // full capture
  let capture: any = null;
  try { capture = await getFlow(projectId, flowId); } catch {}

  // recent runs (project scope)
  let runs: any = { items: [], count: 0 };
  try { runs = await listRuns(projectId, undefined, 10, 0); } catch {}

  const pages = capture?.pages ?? [];
  const elements = flattenElements(pages);
  const steps = deriveSteps(capture);

  return (
    <div className="space-y-4">
      <section className="card">
        <h3 className="card-header">Flow</h3>
        <div className="card-body flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Flow ID</div>
            <div className="font-mono text-base break-all">{flowId}</div>
            <div className="text-xs text-gray-500">
              Project: <span className="font-mono">{projectId}</span>
              {meta?.start_url ? (
                <> · Start: <span className="truncate inline-block max-w-[420px] align-bottom">{meta.start_url}</span></>
              ) : null}
            </div>
            {!capture && (
              <div className="text-xs text-red-600">Flow metadata not found.</div>
            )}
          </div>
          <div className="flex gap-2">
            <ReplayFlowButton flowId={flowId} projectId={projectId} />
            <a className="btn" href={`/replays?project=${encodeURIComponent(projectId)}`}>Open Replays</a>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="card-header">Details</h3>
        <div className="card-body">
          <Tabs
            tabs={[
              { id: "steps", label: "Steps" },
              { id: "elements", label: `Elements (${elements.length})` },
              { id: "runs", label: "Recent Runs" },
              { id: "pages", label: `Pages (${pages.length})` },
              { id: "raw", label: "Raw JSON" },
            ]}
            initialId="runs"
          >
            <TabPanel id="runs">
              <div className="overflow-x-auto">
                <table className="default">
                  <thead><tr><th>Run ID</th><th>Status</th><th>Passed</th><th>Total</th><th>Duration</th><th>When</th></tr></thead>
                  <tbody>
                    {runs.items.map((r: any) => (
                      <tr key={r.id}>
                        <td className="font-mono">
                          <a className="underline" href={`/replays/${encodeURIComponent(r.run_id_ext)}?project=${encodeURIComponent(r.project_id)}`}>{r.run_id_ext}</a>
                        </td>
                        <td><StatusBadge status={r.status} /></td>
                        <td>{r.passed}</td>
                        <td>{r.total}</td>
                        <td>{(r.duration_ms/1000).toFixed(1)}s</td>
                        <td>{new Date(r.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {!runs.items.length && <tr><td colSpan={6} className="py-6 text-center text-sm text-gray-500">No recent runs.</td></tr>}
                  </tbody>
                </table>
              </div>
            </TabPanel>

            <TabPanel id="steps">
              {steps.length ? <StepsTable rows={steps} /> : <p className="text-sm text-gray-500">No structured steps detected in capture.</p>}
            </TabPanel>

            <TabPanel id="elements">
              <ElementsTable rows={elements} />
            </TabPanel>

            <TabPanel id="pages">
              <PagesTable pages={pages} />
            </TabPanel>

            <TabPanel id="raw">
              <pre className="text-xs whitespace-pre-wrap break-all bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                {capture ? JSON.stringify(capture, null, 2) : "No data."}
              </pre>
            </TabPanel>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

/* ---------- helpers for tables ---------- */

function flattenElements(pages: any[]) {
  const rows: any[] = [];
  for (const p of pages ?? []) {
    const dict = p?.elements || {};
    for (const [key, el] of Object.entries<any>(dict)) {
      const preferred =
        el?.selectors?.preferred?.value ||
        el?.selectors_json?.preferred?.value ||
        el?.selectors_json?.preferred ||
        el?.selectors?.preferred;
      rows.push({
        pageUrl: p.url,
        elementKey: el?.element_key || key,
        semantic_role: el?.semantic_role,
        aria_role: el?.aria_role,
        html_tag: el?.html_tag,
        text_content: el?.text || el?.text_content,
        preferredSelector: preferred || null,
      });
    }
  }
  return rows;
}

function deriveSteps(capture: any): any[] {
  if (!capture) return [];
  if (Array.isArray(capture.steps)) return capture.steps;

  const rows: any[] = [];
  for (const p of capture.pages ?? []) {
    const dict = p?.elements || {};
    for (const [key, el] of Object.entries<any>(dict)) {
      const interactions = el?.interactions || el?.element_interactions;
      if (Array.isArray(interactions)) {
        for (const it of interactions) {
          rows.push({
            page_url: p.url,
            element_key: el?.element_key || key,
            action: it?.action || it?.kind || "-",
            value: it?.value || it?.input_value || "",
            when: it?.occurred_at || it?.created_at || "",
            status: it?.ok === false ? "failed" : "passed",
          });
        }
      }
    }
  }
  return rows;
}

function StepsTable({ rows }: { rows: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="default">
        <thead><tr><th>When</th><th>Action</th><th>Element</th><th>Value</th><th>Page</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((s, i) => (
            <tr key={i}>
              <td>{s.when ? new Date(s.when).toLocaleString() : "-"}</td>
              <td>{s.action}</td>
              <td className="font-mono">{s.element_key}</td>
              <td className="truncate max-w-[240px]">{s.value || "-"}</td>
              <td className="truncate max-w-[320px]">{s.page_url}</td>
              <td className="capitalize">{s.status || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ElementsTable({ rows }: { rows: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="default">
        <thead><tr><th>Page</th><th>Element Key</th><th>Role / Tag</th><th>Text</th><th>Selector (preferred)</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="truncate max-w-[320px]">{r.pageUrl}</td>
              <td className="font-mono">{r.elementKey ?? "-"}</td>
              <td>{r.semantic_role || r.aria_role || r.html_tag || "-"}</td>
              <td className="truncate max-w-[320px]">{r.text_content ?? "-"}</td>
              <td className="truncate max-w-[420px] font-mono text-xs">{r.preferredSelector ?? "-"}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} className="py-6 text-center text-sm text-gray-500">No elements found in capture.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function PagesTable({ pages }: { pages: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="default">
        <thead><tr><th>URL</th><th>Title</th><th>First Seen</th><th>Last Seen</th><th># Elements</th></tr></thead>
        <tbody>
          {pages.map((p: any, i: number) => (
            <tr key={i}>
              <td className="truncate max-w-[460px]">{p.url}</td>
              <td className="truncate max-w-[260px]">{p.title ?? "-"}</td>
              <td>{p.first_seen_at ? new Date(p.first_seen_at).toLocaleString() : "-"}</td>
              <td>{p.last_seen_at ? new Date(p.last_seen_at).toLocaleString() : "-"}</td>
              <td>{p.elements ? Object.keys(p.elements).length : 0}</td>
            </tr>
          ))}
          {!pages.length && <tr><td colSpan={5} className="py-6 text-center text-sm text-gray-500">No pages in capture.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
