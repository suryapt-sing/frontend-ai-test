import { listFlows } from "@/lib/api";
import ReplayFlowButton from "@/components/ReplayFlowButton";

export default async function Page() {
  let flows: any[] = [];
  try { flows = await listFlows(); } catch {}
  return (
    <div className="card">
      <h3 className="card-header">Flows</h3>
      <div className="card-body overflow-x-auto">
        <table className="default">
          <thead>
            <tr>
              <th>Project</th>
              <th>Flow ID</th>
              <th>Start URL</th>
              <th>Started</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flows.map((f) => (
              <tr key={f.flow_id_ext}>
                <td>{f.project_id}</td>
                <td className="font-mono">{f.flow_id_ext}</td>
                <td className="truncate max-w-[380px]">{f.start_url}</td>
                <td>{new Date(f.started_at).toLocaleString()}</td>
                <td className="text-right space-x-2">
                  <a
                    href={`/flows/${encodeURIComponent(f.flow_id_ext)}?project=${encodeURIComponent(f.project_id)}`}
                    className="btn"
                  >
                    View
                  </a>
                  <ReplayFlowButton flowId={f.flow_id_ext} projectId={f.project_id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
