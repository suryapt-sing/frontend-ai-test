export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    passed: "badge badge-pass",
    failed: "badge badge-fail",
    mixed: "badge badge-flaky",
  };
  return <span className={map[status] || "badge"}>{status}</span>;
}
