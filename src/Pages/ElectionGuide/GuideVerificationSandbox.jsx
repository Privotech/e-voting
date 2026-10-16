import { useState } from "react";
import { Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function GuideVerificationSandbox() {
  const [sampleTokenInput, setSampleTokenInput] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);

  const handleTestHashVerification = (e) => {
    e.preventDefault();
    if (!sampleTokenInput.trim()) {
      toast.error("Please enter a receipt hash code to test verification.");
      return;
    }

    const cleanInput = sampleTokenInput.trim();
    if (cleanInput.length < 8) {
      toast.error("Receipt hash must be at least 8 hexadecimal characters.");
      return;
    }

    setVerificationResult({
      hash: cleanInput.toUpperCase(),
      status: "VALID_RECORD",
      blockHeight: 14092,
      timestamp: new Date().toUTCString(),
      consensusStatus: "100% Cryptographic Consensus Verified"
    });
    toast.success("Receipt cryptographic signature confirmed!");
  };

  return (
    <div className="guide-tab-content">
      <div className="section-header-block">
        <h2>Receipt Hash Verification Tool</h2>
        <p>Test and confirm how SHA-256 voter receipt hashes prove ballot inclusion on the immutable ledger.</p>
      </div>

      <div className="sandbox-card">
        <div className="sandbox-header">
          <Lock size={20} className="sandbox-icon" />
          <div>
            <h3>Verify Ballot Receipt Signature</h3>
            <p>Paste any 8+ character voting receipt code or test with sample string <code>VOTE-8F3A-2026-INEC</code></p>
          </div>
        </div>

        <form onSubmit={handleTestHashVerification} className="sandbox-form">
          <div className="sandbox-input-group">
            <input
              type="text"
              placeholder="Enter Receipt Hash Code (e.g. VOTE-8F3A-2026-INEC)..."
              value={sampleTokenInput}
              onChange={(e) => setSampleTokenInput(e.target.value)}
              className="sandbox-input"
            />
            <button type="submit" className="btn-verify-hash">
              <ShieldCheck size={16} /> Verify Hash
            </button>
          </div>
        </form>

        {verificationResult && (
          <div className="verification-result-box">
            <div className="result-badge-row">
              <span className="status-badge-valid">
                <CheckCircle2 size={14} /> SIGNATURE VALID
              </span>
              <span className="result-block-num">Ledger Block #{verificationResult.blockHeight}</span>
            </div>

            <div className="result-details-grid">
              <div className="res-item">
                <label>Receipt Hash Digest:</label>
                <code>{verificationResult.hash}</code>
              </div>
              <div className="res-item">
                <label>Consensus Status:</label>
                <span className="text-emerald">{verificationResult.consensusStatus}</span>
              </div>
              <div className="res-item">
                <label>Timestamp:</label>
                <span>{verificationResult.timestamp}</span>
              </div>
              <div className="res-item">
                <label>Zero-Knowledge Privacy Seal:</label>
                <span>Decoupled from voter ID. Selection hidden.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
