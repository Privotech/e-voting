import { Users, Lock, AlertCircle, ShieldCheck } from "lucide-react";

export default function GuideRulesTab() {
  return (
    <div className="guide-tab-content">
      <div className="section-header-block">
        <h2>Electoral Rules & Code of Integrity</h2>
        <p>Key legal frameworks, voter eligibility standards, and privacy rights governing the 2026 election.</p>
      </div>

      <div className="rules-grid">
        <div className="rule-card">
          <div className="rule-header">
            <Users className="rule-icon" size={20} />
            <h3>1. Voter Eligibility Criteria</h3>
          </div>
          <ul className="rule-list">
            <li>Must be a citizen of Nigeria aged 18 years or older on election day.</li>
            <li>Must be registered in the INEC National Voter Database.</li>
            <li>Must possess an active, authenticated NIN or VIN credential.</li>
            <li>Entitled to exactly <strong>one (1) ballot</strong> across all contested positions.</li>
          </ul>
        </div>

        <div className="rule-card">
          <div className="rule-header">
            <Lock className="rule-icon" size={20} />
            <h3>2. Ballot Privacy & Secrecy</h3>
          </div>
          <ul className="rule-list">
            <li>Votes are completely decoupled from voter identity using zero-knowledge signatures.</li>
            <li>No electoral officer, government official, or system admin can view individual voter choices.</li>
            <li>Screenshots or public broadcasts of marked ballots are prohibited to combat vote buying.</li>
          </ul>
        </div>

        <div className="rule-card">
          <div className="rule-header">
            <AlertCircle className="rule-icon" size={20} />
            <h3>3. Prohibited Electoral Offenses</h3>
          </div>
          <ul className="rule-list">
            <li>Attempting multiple vote submissions using forged or stolen voter IDs.</li>
            <li>Soliciting, offering, or accepting financial compensation in exchange for votes.</li>
            <li>Interfering with digital polling network nodes or attempting unauthorized admin access.</li>
            <li>Violators face automatic session suspension and immediate prosecution under electoral law.</li>
          </ul>
        </div>

        <div className="rule-card">
          <div className="rule-header">
            <ShieldCheck className="rule-icon" size={20} />
            <h3>4. Public Auditability Guarantee</h3>
          </div>
          <ul className="rule-list">
            <li>All votes generate a cryptographically chained SHA-256 block hash.</li>
            <li>Election observation bodies and citizen groups can verify tally calculations independently.</li>
            <li>Turnout metrics and candidate aggregates update live across all 36 states and FCT.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
