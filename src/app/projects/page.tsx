import { listProjects } from "@/lib/api";
import ProjectCreateDialog from "@/components/ProjectCreateDialog";

export const dynamic = "force-dynamic";

export default async function Page() {
  let projects: import("@/lib/types").Project[] = [];
  try { projects = await listProjects(); } catch {}

  return (
    <div className="border rounded-lg bg-background">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h3 className="text-base font-semibold">Projects</h3>
        <ProjectCreateDialog />
      </div>

      <div className="p-0">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-44 gap-2 text-center">
            <p className="text-sm text-muted-foreground">No projects yet. Create your first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-2 w-[240px]">Project</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2 w-[180px]">Created</th>
                  <th className="px-4 py-2 w-[180px]">Updated</th>
                  <th className="px-4 py-2 text-right w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.project_id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="font-mono">{p.project_label}</div>
                      <div className="text-xs text-muted-foreground">{p.project_id}</div>
                    </td>
                    <td className="px-4 py-2 max-w-[560px] truncate">
                      {p.project_description || <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2">{p.created_at ? new Date(p.created_at).toLocaleString() : "—"}</td>
                    <td className="px-4 py-2">{p.updated_at ? new Date(p.updated_at).toLocaleString() : "—"}</td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <a className="btn" href="/flows">Open Flows</a>
                      <a className="btn" href={`/replays?project=${encodeURIComponent(p.project_id)}`}>View Replays</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
