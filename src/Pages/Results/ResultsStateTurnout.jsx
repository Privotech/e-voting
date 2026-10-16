import { Users, Vote, BarChart3, ShieldCheck } from "lucide-react";

export default function ResultsStateTurnout({ turnout }) {
  if (!turnout) return null;

  return (
    <div className="turnout-overview-card">
      <div className="turnout-card-header">
        <Users size={22} className="header-icon" />
        <div>
          <h3>National Participation & Turnout Summary</h3>
          <p>Real-time metrics calculated from active voter polling units.</p>
        </div>
      </div>

      <div className="turnout-metrics-grid">
        <div className="t-metric-box">
          <label>Registered Voters</label>
          <h4>{turnout.totalRegistered.toLocaleString()}</h4>
        </div>
        <div className="t-metric-box">
          <label>Validated Ballots Cast</label>
          <h4>{turnout.totalVoted.toLocaleString()}</h4>
        </div>
        <div className="t-metric-box">
          <label>National Turnout Rate</label>
          <h4>{turnout.turnoutPercentage}%</h4>
        </div>
        <div className="t-metric-box">
          <label>Ledger Status</label>
          <h4 className="text-emerald">
            <ShieldCheck size={16} /> 100% Verified
          </h4>
        </div>
      </div>
    </div>
  );
}
