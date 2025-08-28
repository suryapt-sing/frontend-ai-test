import { listFlows, getFlow, listRuns } from "@/lib/api";
import { Tabs, TabPanel } from "@/components/Tabs";
import { StatusBadge } from "@/components/StatusBadge";
import ReplayFlowButton from "@/components/ReplayFlowButton";

function toArr<T>(obj: Record<string, T> | undefined) {
  return Object.values(obj || {});
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { flow_id: string };
  searchParams: { [k: string]: string | undefined };
}) {
  const flowId = decodeURIComponent(params.flow_id);
  let projectId = searchParams.project; // optional in URL

  // If project not provided, discover it from /api/flows list
  if (!projectId) {
    try {
      const all = await listFlows();
      const found = all.find((f: any) => f.flow_id_ext === flowId);
      if (found) projectId = found.project_id;
    } catch {}
  }

  // Fetch capture if we have a project; otherwise show a gentle error
  let capture: import("@/lib/types").FlowCapture | null = null;
  if (projectId) {
    try {
      capture = await getFlow(projectId, flowId);
    } catch {
      capture = null;
    }
  }

  // Recent runs for this project (to mirror your previous "Recent Runs" tab)
  let runs: any = { items: [], count: 0 };
  if (projectId) {
    try {
      runs = await listRuns(projectId, undefined, 10, 0);
    } catch {}
  }

  const header = {
    project_id: projectId || "(unknown)",
    flow_id: flowId,
    start_url: capture?.project?.start_url ?? "",
    started_at: capture?.project?.started_at ?? "",
  };

  // Flatten elements across pages for the "All Elements" view
  const flatElements = (capture?.pages || []).flatMap((p) => {
    const arr = toArr(p.elements);
    return arr.map((el) => ({ ...el, _page: { url: p.url, title: p.title } }));
  });

  return (
    <div className="space-y-4">
      <section className="card">
        <h3 className="card-header">Flow</h3>
        <div className="card-body flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Flow ID</div>
            <div className="font-mono text-base break-all">{header.flow_id}</div>
            <div className="text-xs text-gray-500">
              Project: <span className="font-mono">{header.project_id}</span>
              {header.start_url ? (
                <> · Start: <a className="underline" href={header.start_url} target="_blank" rel="noreferrer">{header.start_url}</a></>
              ) : null}
            </div>
            {header.started_at ? (
              <div className="text-xs text-gray-500">Started: {new Date(header.started_at).toLocaleString()}</div>
            ) : null}
          </div>
          <div className="flex gap-2">
            {projectId ? <ReplayFlowButton flowId={flowId} projectId={projectId} /> : null}
            <a className="btn" href={`/replays?${new URLSearchParams({ project: projectId || "all" }).toString()}`}>Open Replays</a>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="card-header">Details</h3>
        <div className="card-body">
          <Tabs
            tabs={[
              { id: "pages", label: `Pages (${capture?.pages?.length || 0})` },
              { id: "elements", label: `All Elements (${flatElements.length})` },
              { id: "runs", label: `Recent Runs (${runs.items.length})` },
            ]}
            initialId="pages"
          >
            <TabPanel id="pages">
              {(capture?.pages || []).length ? (
                <div className="space-y-6">
                  {(capture?.pages || []).map((p, idx) => {
                    const elements = toArr(p.elements);
                    return (
                      <div key={idx} className="border rounded-xl border-gray-200 dark:border-gray-700">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="text-sm font-medium">
                            {p.title || "(untitled page)"}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            <a className="underline" href={p.url} target="_blank" rel="noreferrer">{p.url}</a>
                          </div>
                          <div className="text-xs text-gray-500">
                            Seen: {p.first_seen_at ? new Date(p.first_seen_at).toLocaleString() : "-"}
                            {" · "}
                            Last: {p.last_seen_at ? new Date(p.last_seen_at).toLocaleString() : "-"}
                          </div>
                          <div className="text-xs text-gray-500">Elements: {elements.length}</div>
                        </div>
                        <div className="p-0 overflow-x-auto">
                          <table className="default">
                            <thead>
                              <tr>
                                <th>Element</th>
                                <th>Role/Tag</th>
                                <th>Text</th>
                                <th>Selector</th>
                                <th>Counts</th>
                                <th>First → Last</th>
                              </tr>
                            </thead>
                            <tbody>
                              {elements.map((el) => {
                                const sel = el.selectors?.preferred?.value || "";
                                const counts = [
                                  el.clicks ? `${el.clicks} clicks` : null,
                                  el.inputs ? `${el.inputs} inputs` : null,
                                  el.submits ? `${el.submits} submits` : null,
                                  el.keys ? `${el.keys} keys` : null,
                                ].filter(Boolean).join(" · ");
                                return (
                                  <tr key={el.element_id}>
                                    <td className="font-mono truncate max-w-[220px]">{el.element_id}</td>
                                    <td className="truncate max-w-[140px]">
                                      {el.semantic_role || el.aria_role || "-"}
                                      {el.html_tag ? ` (${el.html_tag})` : ""}
                                    </td>
                                    <td className="truncate max-w-[280px]">{el.text || "-"}</td>
                                    <td className="truncate max-w-[320px]">{sel || "-"}</td>
                                    <td className="text-xs">{counts || "-"}</td>
                                    <td className="text-xs">
                                      {el.first_seen_at ? new Date(el.first_seen_at).toLocaleTimeString() : "-"} →{" "}
                                      {el.last_seen_at ? new Date(el.last_seen_at).toLocaleTimeString() : "-"}
                                    </td>
                                  </tr>
                                );
                              })}
                              {!elements.length && (
                                <tr><td colSpan={6} className="py-6 text-center text-sm text-gray-500">No elements captured on this page.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Interaction history per page (flattened) */}
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-sm font-medium mb-2">Interaction History</div>
                          <div className="overflow-x-auto">
                            <table className="default">
                              <thead>
                                <tr>
                                  <th>Time</th>
                                  <th>Element</th>
                                  <th>Action</th>
                                  <th>Value</th>
                                  <th>Screenshot</th>
                                  <th>Note</th>
                                </tr>
                              </thead>
                              <tbody>
                                {elements
                                  .flatMap((el) =>
                                    (el.interaction_history || []).map((h) => ({ el, h }))
                                  )
                                  .sort((a, b) => new Date(a.h.at).getTime() - new Date(b.h.at).getTime())
                                  .map(({ el, h }, i) => (
                                    <tr key={`${el.element_id}-${i}`}>
                                      <td className="text-xs">{new Date(h.at).toLocaleString()}</td>
                                      <td className="font-mono truncate max-w-[220px]">{el.element_id}</td>
                                      <td className="font-mono">{h.action}</td>
                                      <td className="truncate max-w-[260px]">
                                        {h.input_redacted ? "••••" : (h.input_value || "-")}
                                      </td>
                                      <td className="truncate max-w-[320px]">
                                        {h.screenshot_path ? <span className="font-mono">{h.screenshot_path}</span> : "-"}
                                      </td>
                                      <td className="truncate max-w-[260px]">{h.admin_note || "-"}</td>
                                    </tr>
                                  ))}
                                {!elements.some((el) => el.interaction_history?.length) && (
                                  <tr><td colSpan={6} className="py-6 text-center text-sm text-gray-500">No interactions recorded on this page.</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No pages in this flow.</p>
              )}
            </TabPanel>

            <TabPanel id="elements">
              <div className="overflow-x-auto">
                <table className="default">
                  <thead>
                    <tr>
                      <th>Element</th>
                      <th>Page</th>
                      <th>Role/Tag</th>
                      <th>Text</th>
                      <th>Selector</th>
                      <th>Counts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flatElements.map((el) => {
                      const sel = el.selectors?.preferred?.value || "";
                      const counts = [
                        el.clicks ? `${el.clicks} clicks` : null,
                        el.inputs ? `${el.inputs} inputs` : null,
                        el.submits ? `${el.submits} submits` : null,
                        el.keys ? `${el.keys} keys` : null,
                      ].filter(Boolean).join(" · ");
                      return (
                        <tr key={el.element_id}>
                          <td className="font-mono truncate max-w-[220px]">{el.element_id}</td>
                          <td className="truncate max-w-[260px]">
                            <div className="truncate">{el._page?.title || "(untitled)"}</div>
                            <div className="text-xs text-gray-500 truncate">{el._page?.url}</div>
                          </td>
                          <td className="truncate max-w-[140px]">
                            {el.semantic_role || el.aria_role || "-"}
                            {el.html_tag ? ` (${el.html_tag})` : ""}
                          </td>
                          <td className="truncate max-w-[280px]">{el.text || "-"}</td>
                          <td className="truncate max-w-[320px]">{sel || "-"}</td>
                          <td className="text-xs">{counts || "-"}</td>
                        </tr>
                      );
                    })}
                    {!flatElements.length && (
                      <tr><td colSpan={6} className="py-6 text-center text-sm text-gray-500">No elements found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabPanel>

            <TabPanel id="runs">
              <div className="overflow-x-auto">
                <table className="default">
                  <thead><tr><th>Run ID</th><th>Status</th><th>Passed</th><th>Total</th><th>Duration</th><th>When</th></tr></thead>
                  <tbody>
                    {runs.items.map((r: any) => (
                      <tr key={r.id}>
                        <td className="font-mono">
                          <a className="underline" href={`/replays/${encodeURIComponent(r.run_id_ext)}?project=${encodeURIComponent(r.project_id)}`}>
                            {r.run_id_ext}
                          </a>
                        </td>
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
          </Tabs>
        </div>
      </section>
    </div>
  );
}
