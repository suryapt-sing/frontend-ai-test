export default function Page() {
  return (
    <div className="space-y-4">
      <section className="card">
        <h3 className="card-header">Analysis</h3>
        <div className="card-body">
          <p className="text-sm text-gray-500">
            Charts coming soon: pass/fail over time, heatmap of failed pages/elements,
            average run duration, and flakiness index. Filters for project and date range.
          </p>
        </div>
      </section>
    </div>
  );
}
