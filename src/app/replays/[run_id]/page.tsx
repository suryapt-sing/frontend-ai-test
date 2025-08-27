import { listRuns, getRunSummary, getReportFull } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabPanel } from "@/components/Tabs";
import { ProjectHealthDonut } from "@/components/DashboardChartsClient";

export default async function Page({
  params,
  searchParams,
}: {
  params: { run_id: string };
  searchParams: { [k: string]: string | undefined };
}) {
  const runId = decodeURIComponent(params.run_id);
  const project = searchParams.project || "default.project";

  // Summary first (DB row)
  let summary: any = null;
  try {
    summary = await getRunSummary(project, runId);
  } catch {}

  // Fallback to listing if needed
  if (!summary) {
    try {
      const runs = await listRuns(project, undefined, 100, 0);
      summary = runs.items.find((r: any) => r.run_id_ext === runId) ?? null;
    } catch {}
  }

  // Full report (steps + meta + summary)
  let report: any = null;
  try {
    report = await getReportFull(project, runId);
  } catch {}

  // Prefer explicit columns from DB (they exist), then report.summary
  const header = {
    status: summary?.status ?? report?.summary?.status ?? "unknown",
    passed: summary?.passed ?? report?.summary?.passed ?? 0,
    failed: summary?.failed ?? report?.summary?.failed ?? 0,
    total: summary?.total ?? report?.summary?.total ?? 0,
    duration_ms: summary?.duration_ms ?? report?.summary?.duration_ms ?? 0,
    created_at: summary?.created_at ?? null,
    start_url: summary?.start_url ?? report?.meta?.start_url ?? null,
    mcp_server: summary?.mcp_server ?? report?.meta?.mcp_server ?? null,
  };

  const steps: any[] = Array.isArray(report?.steps) ? report.steps : [];

  return (
    <div className="space-y-4">
      <section className="card">
        <h3 className="card-header">Replay</h3>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Run ID</div>
              <div className="font-mono text-base break-all">{runId}</div>
              <div className="text-xs text-gray-500">
                Project: <span className="font-mono">{project}</span>
              </div>
            </div>

            <div className="max-w-[180px]">
              {/* your donut expects latest={passed,total} */}
              <ProjectHealthDonut latest={{ passed: header.passed, total: header.total }} />
            </div>

            <div className="space-y-1 text-sm">
              {header.total ? (
                <>
                  <div>Status: <StatusBadge status={header.status} /></div>
                  <div>Passed: {header.passed} / {header.total} ({header.total ? Math.round((header.passed / header.total) * 100) : 0}%)</div>
                  <div>Failed: {header.failed}</div>
                  <div>Duration: {(header.duration_ms / 1000).toFixed(1)}s</div>
                  <div>When: {header.created_at ? new Date(header.created_at).toLocaleString() : "-"}</div>
                  {header.start_url && (
                    <div className="truncate">
                      Start URL: <a className="underline" href={header.start_url} target="_blank" rel="noreferrer">{header.start_url}</a>
                    </div>
                  )}
                  {header.mcp_server && <div>MCP: <span className="font-mono">{header.mcp_server}</span></div>}
                </>
              ) : (
                <div className="text-sm text-red-600">Run not found in project.</div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <a className="btn" href={`/replays?project=${encodeURIComponent(project)}`}>Back to Replays</a>
            {header.start_url ? <a className="btn" href={header.start_url} target="_blank" rel="noreferrer">Open Start URL</a> : null}
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="card-header">Details</h3>
        <div className="card-body">
          <Tabs
            tabs={[
              { id: "summary", label: "Summary" },
              { id: "steps", label: `Steps (${steps.length})` },
              { id: "logs", label: "Logs" },
              { id: "network", label: "Network" },
            ]}
            initialId="summary"
          >
            <TabPanel id="summary">
              <SummaryTable runId={runId} project={project} header={header} report={report} />
            </TabPanel>

            <TabPanel id="steps">
              <StepsTable steps={steps} />
            </TabPanel>

            <TabPanel id="logs">
              <LogsTable steps={steps} />
            </TabPanel>

            <TabPanel id="network">
              <NetworkTable steps={steps} />
            </TabPanel>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

/* ---------- Summary ---------- */
function SummaryTable({ runId, project, header, report }: { runId: string; project: string; header: any; report: any }) {
  return (
    <div className="overflow-x-auto">
      <table className="default">
        <tbody>
          <tr><th>Run</th><td className="font-mono">{runId}</td></tr>
          <tr><th>Project</th><td className="font-mono">{project}</td></tr>
          <tr><th>Status</th><td><StatusBadge status={header.status || "unknown"} /></td></tr>
          <tr><th>Passed</th><td>{header.passed} / {header.total}</td></tr>
          <tr><th>Failed</th><td>{header.failed}</td></tr>
          <tr><th>Duration</th><td>{(header.duration_ms / 1000).toFixed(1)}s</td></tr>
          <tr><th>Created</th><td>{header.created_at ? new Date(header.created_at).toLocaleString() : "-"}</td></tr>
          {header.start_url ? (
            <tr><th>Start URL</th><td className="truncate"><a className="underline" href={header.start_url} target="_blank" rel="noreferrer">{header.start_url}</a></td></tr>
          ) : null}
          {header.mcp_server ? <tr><th>MCP</th><td className="font-mono">{header.mcp_server}</td></tr> : null}
          {report?.summary?.llm_summary ? (
            <tr>
              <th>LLM Summary</th>
              <td><p className="whitespace-pre-wrap text-sm">{report.summary.llm_summary}</p></td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Steps ---------- */
function StepsTable({ steps }: { steps: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="default">
        <thead>
          <tr>
            <th>#</th>
            <th>Status</th>
            <th>Action</th>
            <th>Text</th>
            <th>Role</th>
            <th>Element</th>
            <th>Page</th>
            <th>Value</th>
            <th>Duration</th>
            <th>Before → After</th>
            <th>Screenshot</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s: any) => (
            <tr key={s.i}>
              <td>{s.i}</td>
              <td><StatusBadge status={s.status === "ok" ? "passed" : "failed"} /></td>
              <td className="font-mono">{s.action}</td>
              <td className="truncate max-w-[240px]">{s.text ?? "-"}</td>
              <td>{s.role ?? "-"}</td>
              <td className="font-mono truncate max-w-[180px]">{s.element_id ?? "-"}</td>
              <td className="truncate max-w-[260px]">{s.page_url ?? "-"}</td>
              <td className="truncate max-w-[220px]">{s.value_used ?? "-"}</td>
              <td>{s.duration_ms ? `${(s.duration_ms / 1000).toFixed(1)}s` : "-"}</td>
              <td className="truncate max-w-[280px]">
                {s.before_url ? `${s.before_url} → ` : ""}{s.after_url ?? "-"}
              </td>
              <td className="truncate max-w-[280px]">
                {s.screenshot ? <span className="font-mono">{s.screenshot}</span> : "-"}
              </td>
            </tr>
          ))}
          {!steps.length && (
            <tr><td colSpan={11} className="py-6 text-center text-sm text-gray-500">No steps in this report.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Logs ---------- */
function LogsTable({ steps }: { steps: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="default">
        <thead>
          <tr>
            <th>#</th>
            <th>Console</th>
            <th>Network</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s: any) => (
            <tr key={s.i}>
              <td>{s.i}</td>
              <td className="text-sm">
                {typeof s.console?.errors === "number" ? `errors: ${s.console.errors}` : ""}
                {typeof s.console?.warnings === "number" ? ` · warnings: ${s.console.warnings}` : ""}
                {typeof s.console?.raw_lines === "number" ? ` · raw: ${s.console.raw_lines}` : ""}
              </td>
              <td className="text-sm">
                {typeof s.network?.lines === "number" ? `${s.network.lines} lines` : "-"}
                {typeof s.network?.suspect === "number" ? ` · suspect: ${s.network.suspect}` : ""}
              </td>
              <td className="truncate max-w-[360px]">{s.notes || "-"}</td>
            </tr>
          ))}
          {!steps.length && <tr><td colSpan={4} className="py-6 text-center text-sm text-gray-500">No logs available.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Network ---------- */
function NetworkTable({ steps }: { steps: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="default">
        <thead>
          <tr>
            <th>#</th>
            <th>Page</th>
            <th>Lines</th>
            <th>Suspect</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s: any) => (
            <tr key={s.i}>
              <td>{s.i}</td>
              <td className="truncate max-w-[360px]">{s.page_url ?? "-"}</td>
              <td>{typeof s.network?.lines === "number" ? s.network.lines : "-"}</td>
              <td>{typeof s.network?.suspect === "number" ? s.network.suspect : "-"}</td>
            </tr>
          ))}
          {!steps.length && <tr><td colSpan={4} className="py-6 text-center text-sm text-gray-500">No network data.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
