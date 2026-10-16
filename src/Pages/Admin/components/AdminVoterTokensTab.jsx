import { useState } from "react";
import { KeyRound, Search, Plus, Copy, Check, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminVoterTokensTab({
  generatedTokens,
  onGenerateBatch,
  onRegisterTokens
}) {
  const [tokenSearch, setTokenSearch] = useState("");
  const [batchCount, setBatchCount] = useState(10);
  const [batchState, setBatchState] = useState("Lagos");
  const [copiedToken, setCopiedToken] = useState(null);

  const handleCreateBatch = (e) => {
    e.preventDefault();
    onGenerateBatch(Number(batchCount), batchState);
    toast.success(`Generated ${batchCount} authorization tokens for ${batchState}!`);
  };

  const handleCopy = (token) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    toast.success("Token copied to clipboard!");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const filteredTokens = generatedTokens.filter((t) =>
    t.token.toLowerCase().includes(tokenSearch.toLowerCase()) ||
    t.state.toLowerCase().includes(tokenSearch.toLowerCase())
  );

  return (
    <div className="admin-tab-content">
      <div className="section-card-header">
        <div>
          <h3>Voter Authorization Token Issuer</h3>
          <p>Issue and manage cryptographically signed, single-use voting tokens.</p>
        </div>
      </div>

      {/* Batch Generator Form */}
      <form onSubmit={handleCreateBatch} className="token-generator-card">
        <div className="gen-inputs-row">
          <div className="input-field">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              max="100"
              value={batchCount}
              onChange={(e) => setBatchCount(e.target.value)}
              required
            />
          </div>

          <div className="input-field">
            <label>Assigned State</label>
            <input
              type="text"
              placeholder="e.g. Lagos, Kano..."
              value={batchState}
              onChange={(e) => setBatchState(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-gen-tokens">
            <Plus size={16} /> Generate Tokens
          </button>
        </div>
      </form>

      {/* Search Bar */}
      <div className="token-search-row">
        <div className="log-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search generated token string or state..."
            value={tokenSearch}
            onChange={(e) => setTokenSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tokens Table */}
      <div className="log-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Token Key</th>
              <th>Assigned Territory</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTokens.map((t, idx) => (
              <tr key={idx}>
                <td className="font-mono">{t.token}</td>
                <td>{t.state}</td>
                <td>
                  <span className="status-badge-green">
                    <ShieldCheck size={12} /> ISSUED & VALID
                  </span>
                </td>
                <td className="text-muted">{new Date(t.createdAt).toLocaleTimeString()}</td>
                <td>
                  <button onClick={() => handleCopy(t.token)} className="btn-icon-copy">
                    {copiedToken === t.token ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
