import { latestRun, listRuns } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import QuickActionsClient from "@/components/QuickActionsClient";
import { ProjectHealthDonut, PassRateTrend } from "@/components/DashboardChartsClient";

export default async function Page() {
  let latest: any = null;
  try { latest = await latestRun("default.project"); } catch {}

  let runs: any = null;
  try { runs = await listRuns("default.project", undefined, 5, 0); } catch {}

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="card col-span-1">
        <h3 className="card-header">Project Health</h3>
        <div className="card-body">
          {latest ? (
            <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
              <ProjectHealthDonut latest={latest} />
              <div className="space-y-2 text-sm">
                <div>Latest run: <span className="font-mono">{latest.run_id_ext}</span></div>
                <div>Status: <StatusBadge status={latest.status} /></div>
                <div>Passed: {latest.passed} / {latest.total}</div>
                <div>Duration: {(latest.duration_ms/1000).toFixed(1)}s</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No runs yet.</p>
          )}
        </div>
      </section>

      <section className="card col-span-2">
        <h3 className="card-header">Latest Replays</h3>
        <div className="card-body overflow-x-auto">
          <table className="default">
            <thead><tr>
              <th>Run ID</th><th>Status</th><th>Passed</th><th>Failed</th><th>Total</th><th>Duration</th><th>When</th>
            </tr></thead>
            <tbody>
              {runs?.items?.map((r:any) => (
                <tr key={r.id}>
                  <td className="font-mono">{r.run_id_ext}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{r.passed}</td>
                  <td>{r.failed}</td>
                  <td>{r.total}</td>
                  <td>{(r.duration_ms/1000).toFixed(1)}s</td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card col-span-3">
        <h3 className="card-header">Quick Actions</h3>
        <div className="card-body">
          <QuickActionsClient />
        </div>
      </section>

      <section className="card col-span-3">
        <h3 className="card-header">Trends</h3>
        <div className="card-body">
          <PassRateTrend runs={runs} />
        </div>
      </section>
    </div>
  );
}
