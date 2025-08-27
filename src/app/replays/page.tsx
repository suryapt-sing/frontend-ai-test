import { listRuns } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default async function Page({ searchParams }: { searchParams: { [k: string]: string | string[] | undefined }}) {
  const project = (searchParams.project as string) || "default.project";
  const status = (searchParams.status as string) || undefined;
  const runs = await listRuns(project, status, 50, 0).catch(() => ({ items: [], count: 0 }));

  return (
    <div className="card">
      <h3 className="card-header">Replays</h3>
      <div className="card-body">
        <form action="/replays" method="get" className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <input name="project" defaultValue={project} placeholder="Project ID" className="rounded-xl border border-gray-300 dark:border-gray-700 px-3 py-1.5" />
          <select name="status" defaultValue={status || ""} className="rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-1.5">
            <option value="">All</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="mixed">Mixed</option>
          </select>
          <button className="btn" type="submit">Filter</button>
        </form>
        <div className="overflow-x-auto">
          <table className="default">
            <thead><tr>
              <th>Run ID</th><th>Status</th><th>Passed</th><th>Failed</th><th>Total</th><th>Duration</th><th>When</th>
            </tr></thead>
            <tbody>
            {runs.items.map((r: any) => (
              <tr key={r.id}>
                <td className="font-mono"><a href={`/replays/${encodeURIComponent(r.run_id_ext)}?project=${encodeURIComponent(r.project_id)}`} className="underline">{r.run_id_ext}</a></td>
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
      </div>
    </div>
  )
}
