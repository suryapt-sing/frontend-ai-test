// app/flows/page.tsx
import { listFlows } from "@/lib/api";
import FlowCreateDialog from "@/components/FlowCreateDialog";
import ReplayFlowButton from "@/components/ReplayFlowButton";

export const dynamic = "force-dynamic";

export default async function Page() {
  let flows: any[] = [];
  try {
    flows = await listFlows();
  } catch {}

  return (
    <div className="border rounded-lg bg-background">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h3 className="text-base font-semibold">Flows</h3>
        <FlowCreateDialog />
      </div>

      <div className="p-0">
        {flows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-44 gap-2 text-center">
            <p className="text-sm text-muted-foreground">No flows yet. Create your first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-2 w-[180px]">Flow ID</th>
                  <th className="px-4 py-2 w-[220px]">Feature</th>
                  <th className="px-4 py-2">Start URL</th>
                  <th className="px-4 py-2 w-[220px]">Project</th>
                  <th className="px-4 py-2 w-[180px]">Created</th>
                  <th className="px-4 py-2 w-[180px]">Started</th>
                  <th className="px-4 py-2 text-right w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flows.map((f) => {
                  const flowId = f.flow_id_ext || f.id;
                  const feature = f.feature_name || "—";
                  const startUrl = f.start_url || "—";
                  const project = f.project_id || "—";
                  const created = f.created_at ? new Date(f.created_at).toLocaleString() : "—";
                  const started = f.started_at ? new Date(f.started_at).toLocaleString() : "—";
                  return (
                    <tr key={`${f.id || flowId}`} className="border-t">
                      <td className="px-4 py-2 font-mono">{flowId}</td>
                      <td className="px-4 py-2 truncate max-w-[260px]">{feature}</td>
                      <td className="px-4 py-2 truncate max-w-[420px]">
                        {startUrl !== "—" ? (
                          <a className="underline" href={startUrl} target="_blank" rel="noreferrer">{startUrl}</a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 font-mono truncate max-w-[260px]">{project}</td>
                      <td className="px-4 py-2">{created}</td>
                      <td className="px-4 py-2">{started}</td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <a
                          href={`/flows/${encodeURIComponent(flowId)}?project=${encodeURIComponent(project !== "—" ? project : "")}`}
                          className="btn"
                        >
                          View
                        </a>
                        {flowId ? (
                          <ReplayFlowButton
                            flowId={flowId}
                            projectId={project !== "—" ? project : undefined}
                          />
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
