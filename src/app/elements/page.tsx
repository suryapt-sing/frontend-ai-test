export default function Page() {
  return (
    <div className="space-y-4">
      <section className="card">
        <h3 className="card-header">Elements DB</h3>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="default">
              <thead><tr>
                <th>Element</th><th>Selector</th><th>Page</th><th>Updated</th>
              </tr></thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-gray-500">
                    Coming soon — connect to backend to populate captured elements.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
