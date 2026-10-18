import { useState } from "react";
import { Filter, FileSpreadsheet, Check } from "lucide-react";

interface AdminTurnoutTabProps {
  onExportCSV: () => void;
}

const stateTurnoutData = [
  { state: "Lagos", registered: 420, voted: 298 },
  { state: "Kano", registered: 380, voted: 260 },
  { state: "Rivers", registered: 310, voted: 215 },
  { state: "Oyo", registered: 290, voted: 185 },
  { state: "Kaduna", registered: 270, voted: 172 },
  { state: "Enugu", registered: 240, voted: 168 },
  { state: "FCT Abuja", registered: 210, voted: 155 },
  { state: "Delta", registered: 190, voted: 130 },
  { state: "Anambra", registered: 180, voted: 122 },
];

export default function AdminTurnoutTab({ onExportCSV }: AdminTurnoutTabProps) {
  const [filterState, setFilterState] = useState("ALL");

  const filteredStates = stateTurnoutData.filter((item) =>
    filterState === "ALL" ? true : item.state === filterState
  );

  return (
    <div className="admin-tab-content">
      <div className="section-card-header">
        <div>
          <h3>State & Zonal Voter Turnout Breakdown</h3>
          <p>Monitored participation rates across registered state polling units.</p>
        </div>

        <div className="filter-select-wrapper">
          <Filter size={16} />
          <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
            <option value="ALL">All States (36 + FCT)</option>
            {stateTurnoutData.map((s) => (
              <option key={s.state} value={s.state}>
                {s.state}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="turnout-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>State / Territory</th>
              <th>Registered Voters</th>
              <th>Ballots Recorded</th>
              <th>Turnout Percentage</th>
              <th>Audit Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStates.map((row) => {
              const rate = ((row.voted / row.registered) * 100).toFixed(1);
              return (
                <tr key={row.state}>
                  <td>
                    <strong>{row.state}</strong>
                  </td>
                  <td>{row.registered.toLocaleString()}</td>
                  <td>{row.voted.toLocaleString()}</td>
                  <td>
                    <div className="progress-cell-wrapper">
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${Math.min(Number(rate), 100)}%` }}
                        />
                      </div>
                      <span className="rate-text">{rate}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge-green">
                      <Check size={12} /> VERIFIED
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="tab-footer-bar">
        <button onClick={onExportCSV} className="btn-action-outline">
          <FileSpreadsheet size={16} /> Export State Turnout CSV
        </button>
      </div>
    </div>
  );
}
