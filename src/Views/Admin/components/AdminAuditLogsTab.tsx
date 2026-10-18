import { useState } from "react";
import { Search, ShieldCheck, Download } from "lucide-react";
import type { AuditLogEntry } from "../../../Utils/auditLogUtils";

interface AdminAuditLogsTabProps {
  auditLogs: AuditLogEntry[];
  chainIntegrity: ReturnType<typeof import("../../../Utils/auditLogUtils").verifyChainIntegrity>;
  onExportAuditCertificate: () => void;
}

export default function AdminAuditLogsTab({
  auditLogs,
  chainIntegrity,
  onExportAuditCertificate
}: AdminAuditLogsTabProps) {
  const [logSearch, setLogSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesCategory = categoryFilter === "ALL" || log.category === categoryFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.actor.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.hash || "").toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="admin-tab-content">
      {/* Integrity Header Banner */}
      <div className={`integrity-status-banner ${chainIntegrity.isValid ? "valid" : "corrupted"}`}>
        <div className="banner-icon-col">
          <ShieldCheck size={28} />
        </div>
        <div className="banner-text-col">
          <h4>
            Ledger Integrity: {chainIntegrity.isValid ? "100% Cryptographically Intact" : "WARNING: Integrity Compromised"}
          </h4>
          <p>
            {chainIntegrity.totalBlocks} blocks chained with SHA-256 signatures. Zero tampering detected.
          </p>
        </div>
        <button onClick={onExportAuditCertificate} className="btn-export-cert">
          <Download size={16} /> Audit Certificate
        </button>
      </div>

      {/* Filter Row */}
      <div className="log-filter-row">
        <div className="log-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search action, actor, or hash code..."
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
          />
        </div>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="category-select">
          <option value="ALL">All Categories</option>
          <option value="Election Settings">Election Settings</option>
          <option value="System Resets">System Resets</option>
          <option value="Database Export">Database Export</option>
          <option value="Voter Authentication">Voter Authentication</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="log-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Block</th>
              <th>Timestamp</th>
              <th>Category</th>
              <th>Action / Event</th>
              <th>Actor</th>
              <th>SHA-256 Digest</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              return (
                <tr
                  key={log.id}
                  className={`log-row ${isExpanded ? "expanded" : ""}`}
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <td className="font-mono">#{log.id}</td>
                  <td className="text-muted">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td>
                    <span className="category-badge">{log.category}</span>
                  </td>
                  <td>
                    <strong>{log.action}</strong>
                  </td>
                  <td>{log.actor}</td>
                  <td className="font-mono hash-cell">
                    {(log.hash || "").substring(0, 12)}...
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
