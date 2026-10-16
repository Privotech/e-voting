import { Award, CheckCircle2 } from "lucide-react";

export default function ResultsPositionSection({ title, candidates = [], totalVotes = 0 }) {
  const winner = candidates.length > 0 ? candidates[0] : null;

  return (
    <section className="position-section">
      <div className="position-header-bar">
        <h2>
          <Award size={20} className="award-icon" /> {title}
        </h2>
        <span className="total-votes-tag">{totalVotes.toLocaleString()} Total Votes</span>
      </div>

      <div className="results-candidates-list">
        {candidates.map((c, index) => {
          const percentage = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : 0;
          const isLead = index === 0 && c.votes > 0;

          return (
            <div key={c.id} className={`results-candidate-card ${isLead ? "leading" : ""}`}>
              <div className="rank-badge">#{index + 1}</div>
              <img src={c.photo} alt={c.name} className="candidate-avatar" />

              <div className="candidate-info-col">
                <div className="candidate-name-party">
                  <h3>{c.name}</h3>
                  <span className="party-chip">{c.partyShort}</span>
                  {isLead && (
                    <span className="leading-tag">
                      <CheckCircle2 size={12} /> LEADING
                    </span>
                  )}
                </div>

                <div className="progress-tally-row">
                  <div className="progress-bar-container">
                    <div
                      className={`progress-fill ${isLead ? "lead-fill" : ""}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="tally-number">
                    <strong>{c.votes.toLocaleString()}</strong> ({percentage}%)
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
