import { ShieldCheck, PlayCircle, PauseCircle, LogOut } from "lucide-react";

export default function AdminHeader({ admin, pollsActive, onTogglePolls, onLogout }) {
  return (
    <div className="admin-header-card">
      <div className="admin-title-block">
        <div className="admin-icon-badge">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h2>Electoral Commission Admin Portal</h2>
          <p>
            Logged in as <strong>{admin?.fullName || "Electoral Officer"}</strong> | Role:{" "}
            <span className="role-chip">{admin?.role || "Chief Admin"}</span>
          </p>
        </div>
      </div>

      <div className="admin-action-row">
        <button
          className={`btn-poll-toggle ${pollsActive ? "active" : "paused"}`}
          onClick={onTogglePolls}
        >
          {pollsActive ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
          <span>{pollsActive ? "Pause Polling" : "Resume Polling"}</span>
        </button>

        <button onClick={onLogout} className="btn-admin-logout">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
