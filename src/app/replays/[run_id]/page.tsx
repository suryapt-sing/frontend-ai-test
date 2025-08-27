/* Replay Detail placeholder: will be fully built in Step 2 */
import { listRuns } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabPanel } from "@/components/Tabs";
import { ProjectHealthDonut } from "@/components/DashboardChartsClient";

export default async function Page({ params, searchParams }: { params: { run_id: string }, searchParams: { [k: string]: string | undefined }}) {
  const { run_id } = params;
  const project = searchParams.project || "default.project";

  let runs: any = { items: [], count: 0 };
  try { runs = await listRuns(project, undefined, 50, 0); } catch {}
  const run = runs.items.find((r: any) => r.run_id_ext === run_id) || null;

  return (
    <div className="space-y-4">
      <section className="card">
        <h3 className="card-header">Replay</h3>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Run ID</div>
              <div className="font-mono text-base">{run_id}</div>
              <div className="text-xs text-gray-500">Project: <span className="font-mono">{project}</span></div>
            </div>
            <div className="max-w-[180px]">
              <ProjectHealthDonut latest={run} />
            </div>
            <div className="space-y-1 text-sm">
              {run ? (
                <>
                  <div>Status: <StatusBadge status={run.status} /></div>
                  <div>Passed: {run.passed} / {run.total} ({run.total ? Math.round((run.passed/run.total)*100) : 0}%)</div>
                  <div>Duration: {(run.duration_ms/1000).toFixed(1)}s</div>
                  <div>When: {new Date(run.created_at).toLocaleString()}</div>
                  {run.start_url && (
                    <div className="truncate">Start URL: <a className="underline" href={run.start_url} target="_blank" rel="noreferrer">{run.start_url}</a></div>
                  )}
                  {run.mcp_server && <div>MCP: <span className="font-mono">{run.mcp_server}</span></div>}
                </>
              ) : (
                <div className="text-sm text-red-600">Run not found in project.</div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <a className="btn" href={`/replays?project=${encodeURIComponent(project)}`}>Back to Replays</a>
            {run?.start_url ? <a className="btn" href={run.start_url} target="_blank" rel="noreferrer">Open Start URL</a> : null}
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="card-header">Details</h3>
        <div className="card-body">
          <Tabs
            tabs={[
              { id: "summary", label: "Summary" },
              { id: "steps", label: "Steps" },
              { id: "logs", label: "Logs" },
              { id: "network", label: "Network" },
            ]}
            initialId="summary"
          >
            <TabPanel id="summary">
              <div className="overflow-x-auto">
                <table className="default">
                  <tbody>
                    <tr><th>Run</th><td className="font-mono">{run_id}</td></tr>
                    <tr><th>Project</th><td className="font-mono">{project}</td></tr>
                    <tr><th>Status</th><td><StatusBadge status={run?.status || "unknown"} /></td></tr>
                    <tr><th>Passed</th><td>{run?.passed ?? 0} / {run?.total ?? 0}</td></tr>
                    <tr><th>Duration</th><td>{run ? (run.duration_ms/1000).toFixed(1) : "-"}s</td></tr>
                    <tr><th>Created</th><td>{run ? new Date(run.created_at).toLocaleString() : "-"}</td></tr>
                    {run?.start_url ? <tr><th>Start URL</th><td className="truncate"><a className="underline" href={run.start_url} target="_blank" rel="noreferrer">{run.start_url}</a></td></tr> : null}
                    {run?.mcp_server ? <tr><th>MCP</th><td className="font-mono">{run.mcp_server}</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </TabPanel>
            <TabPanel id="steps">
              <p className="text-sm text-gray-500">Steps timeline coming soon.</p>
            </TabPanel>
            <TabPanel id="logs">
              <p className="text-sm text-gray-500">Logs viewer coming soon.</p>
            </TabPanel>
            <TabPanel id="network">
              <p className="text-sm text-gray-500">Network inspector coming soon.</p>
            </TabPanel>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
