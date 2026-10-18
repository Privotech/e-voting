import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface ResultsHeaderProps {
  isAdmin: boolean;
  isVisible: boolean;
  onShowAdminModal: () => void;
  onToggleVisibility: () => void;
  onExitAdmin: () => void;
}

export default function ResultsHeader({
  isAdmin,
  isVisible,
  onShowAdminModal,
  onToggleVisibility,
  onExitAdmin
}: ResultsHeaderProps) {
  return (
    <header className="results-header">
      <div className="header-content">
        <h1>Live Election Tally & Results</h1>
        <p>Real-time authenticated vote ledger aggregation</p>
      </div>

      <div className="header-actions">
        {!isAdmin ? (
          <button className="btn-admin" onClick={onShowAdminModal}>
            <Lock size={15} /> Electoral Admin Access
          </button>
        ) : (
          <div className="admin-actions-bar">
            <span className="admin-badge">
              <ShieldCheck size={14} /> Electoral Admin Mode
            </span>
            <button className="btn-toggle-visibility" onClick={onToggleVisibility}>
              {isVisible ? <EyeOff size={15} /> : <Eye size={15} />}
              {isVisible ? "Hide Results" : "Publish Results"}
            </button>
            <button className="btn-logout-admin" onClick={onExitAdmin}>
              Exit Admin Mode
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
