import { listRuns } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

function str(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v || "";
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const projectParam = str(searchParams.project); // "" | "all" | "<project_id>"
  const project = projectParam && projectParam !== "all" ? projectParam : undefined; // undefined => ALL projects
  const status = str(searchParams.status) || undefined;
  const q = str(searchParams.q).toLowerCase();
  const limit = Number(str(searchParams.limit) || "100");
  const offset = Number(str(searchParams.offset) || "0");

  const runsResp = await listRuns(project, status, limit, offset).catch(() => ({
    items: [],
    count: 0,
  }));

  const allProjects: string[] = Array.from(
    new Set((runsResp.items || []).map((r: any) => r.project_id))
  ).sort();

  const items = (runsResp.items || []).filter((r: any) => {
    if (!q) return true;
    const hay = `${r.project_id} ${r.run_id_ext} ${r.start_url || ""} ${r.status || ""}`.toLowerCase();
    return hay.includes(q);
  });

  return (
    <div className="card">
      <h3 className="card-header">Replays</h3>
      <div className="card-body">
        <form action="/replays" method="get" className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 items-center text-sm">
          <div className="flex items-center gap-2">
            <label className="w-20 text-gray-600 dark:text-gray-300">Project</label>
            <select
              name="project"
              defaultValue={projectParam || "all"}
              className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-1.5"
            >
              <option value="all">All projects</option>
              {allProjects.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="w-20 text-gray-600 dark:text-gray-300">Status</label>
            <select
              name="status"
              defaultValue={status || ""}
              className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-1.5"
            >
              <option value="">All</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="w-20 text-gray-600 dark:text-gray-300">Search</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Run ID, URL, status…"
              className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 px-3 py-1.5"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="w-20 text-gray-600 dark:text-gray-300">Limit</label>
            <input
              name="limit"
              type="number"
              min={1}
              max={200}
              defaultValue={limit}
              className="w-28 rounded-xl border border-gray-300 dark:border-gray-700 px-3 py-1.5"
            />
            <input type="hidden" name="offset" value={offset} />
            <button className="btn ml-auto" type="submit">Apply</button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="default">
            <thead>
              <tr>
                <th>Project</th>
                <th>Run ID</th>
                <th>Status</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Total</th>
                <th>Duration</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any) => (
                <tr key={r.id}>
                  <td className="font-mono truncate max-w-[220px]">{r.project_id}</td>
                  <td className="font-mono">
                    <a
                      href={`/replays/${encodeURIComponent(r.run_id_ext)}?project=${encodeURIComponent(r.project_id)}`}
                      className="underline"
                    >
                      {r.run_id_ext}
                    </a>
                  </td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{r.passed}</td>
                  <td>{r.failed}</td>
                  <td>{r.total}</td>
                  <td>{(r.duration_ms / 1000).toFixed(1)}s</td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-sm text-gray-500">No runs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex justify-between text-sm">
          <a
            className="btn"
            href={`/replays?${new URLSearchParams({
              project: projectParam || "all",
              status: status || "",
              q,
              limit: String(limit),
              offset: String(Math.max(0, offset - limit)),
            }).toString()}`}
          >
            ← Prev
          </a>
          <a
            className="btn"
            href={`/replays?${new URLSearchParams({
              project: projectParam || "all",
              status: status || "",
              q,
              limit: String(limit),
              offset: String(offset + limit),
            }).toString()}`}
          >
            Next →
          </a>
        </div>
      </div>
    </div>
  );
}
