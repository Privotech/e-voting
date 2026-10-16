import { BarChart3, Vote, Users, Award, RotateCcw, FileSpreadsheet, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AdminOverviewTab({
  turnout,
  totalRegistered,
  totalVoted,
  totalCandidates,
  chartPosition,
  setChartPosition,
  chartData,
  onResetVotes,
  onExportCSV,
  onPrintPDF,
  showResetConfirm,
  setShowResetConfirm
}) {
  return (
    <div className="admin-tab-content">
      {/* Metrics Row */}
      <div className="metrics-summary-grid">
        <div className="metric-card">
          <div className="metric-icon blue">
            <Users size={22} />
          </div>
          <div className="metric-info">
            <label>Registered Voters</label>
            <h3>{totalRegistered.toLocaleString()}</h3>
            <span className="metric-sub">INEC Verified Registry</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon green">
            <Vote size={22} />
          </div>
          <div className="metric-info">
            <label>Ballots Cast</label>
            <h3>{totalVoted.toLocaleString()}</h3>
            <span className="metric-sub">SHA-256 Ledger Verified</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon purple">
            <BarChart3 size={22} />
          </div>
          <div className="metric-info">
            <label>Voter Turnout Rate</label>
            <h3>{turnout.turnoutPercentage}%</h3>
            <span className="metric-sub">Across 36 States & FCT</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon orange">
            <Award size={22} />
          </div>
          <div className="metric-info">
            <label>Total Candidates</label>
            <h3>{totalCandidates}</h3>
            <span className="metric-sub">4 Office Contests</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-preview-card">
        <div className="chart-card-header">
          <div>
            <h3>Live Tally Distribution</h3>
            <p>Real-time vote distribution across certified candidates.</p>
          </div>

          <div className="chart-selector-group">
            {["president", "governor", "senator", "houseOfReps"].map((pos) => (
              <button
                key={pos}
                className={`btn-pos-select ${chartPosition === pos ? "active" : ""}`}
                onClick={() => setChartPosition(pos)}
              >
                {pos === "houseOfReps" ? "House" : pos.charAt(0).toUpperCase() + pos.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-render-area">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="shortName" stroke="var(--text-muted)" fontSize={12} />
              <YAxis allowDecimals={false} stroke="var(--text-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                  borderRadius: "10px",
                  color: "var(--text-primary)"
                }}
              />
              <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card-footer">
          <div className="action-button-group">
            <button onClick={onExportCSV} className="btn-action-outline">
              <FileSpreadsheet size={16} /> Export Results CSV
            </button>
            <button onClick={onPrintPDF} className="btn-action-outline">
              <Printer size={16} /> Print Tally PDF
            </button>
            <button onClick={() => setShowResetConfirm(true)} className="btn-action-danger">
              <RotateCcw size={16} /> Reset Baseline Votes
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Confirm Pre-Launch Tally Reset</h3>
            <p>
              Are you sure you want to reset all candidate vote counts to baseline (2 votes) and clear session caches? This action will be logged in the immutable audit ledger.
            </p>
            <div className="modal-actions">
              <button onClick={() => setShowResetConfirm(false)} className="btn-modal-cancel">
                Cancel
              </button>
              <button onClick={onResetVotes} className="btn-modal-confirm-danger">
                Yes, Reset Tally
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
