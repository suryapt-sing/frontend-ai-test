import { getFlow, listFlows, listRuns } from "@/lib/api";
import ReplayFlowButton from "@/components/ReplayFlowButton";
import { Tabs, TabPanel } from "@/components/Tabs";
import { StatusBadge } from "@/components/StatusBadge";

export default async function Page({ params }: { params: { flow_id: string }}) {
  const { flow_id } = params;

  let flows: any[] = [];
  try { flows = await listFlows(); } catch {}
  const flow = flows.find((f) => f.flow_id_ext === flow_id) || null;
  console.log(flow);

  let runs: any = { items: [], count: 0 };
  const projectId = flow?.project_id;
  if (projectId) {
    try { runs = await listRuns(projectId, undefined, 5, 0); } catch {}
  }

  return (
    <div className="space-y-4">
      <section className="card">
        <h3 className="card-header">Flow</h3>
        <div className="card-body flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Flow ID</div>
            <div className="font-mono text-base">{flow_id}</div>
            {flow ? (
              <div className="text-xs text-gray-500">
                Project: <span className="font-mono">{flow.project_id}</span>
                {flow.start_url ? <> · Start: <span className="truncate inline-block max-w-[420px] align-bottom">{flow.start_url}</span></> : null}
              </div>
            ) : (
              <div className="text-xs text-red-600">Flow metadata not found.</div>
            )}
          </div>
          <div className="flex gap-2">
            {flow ? <ReplayFlowButton flowId={flow.flow_id_ext} /> : null}
            <a className="btn" href={`/replays?project=${encodeURIComponent(projectId || "")}`}>Open Replays</a>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="card-header">Details</h3>
        <div className="card-body">
          <Tabs
            tabs={[
              { id: "steps", label: "Steps" },
              { id: "elements", label: "Elements" },
              { id: "runs", label: "Recent Runs" },
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
                        <td className="font-mono"><a className="underline" href={`/replays/${encodeURIComponent(r.run_id_ext)}?project=${encodeURIComponent(r.project_id)}`}>{r.run_id_ext}</a></td>
                        <td className="capitalize"><StatusBadge status={r.status} /></td>
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
              <p className="text-sm text-gray-500">Steps view coming soon.</p>
            </TabPanel>
            <TabPanel id="elements">
              <p className="text-sm text-gray-500">Elements view coming soon.</p>
            </TabPanel>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
