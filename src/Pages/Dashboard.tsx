"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "../Utils/nextNavigation";
import { votedVoters, getVoterReceipt, getVoterInfo, candidates } from "../Utils/voterData";
import { CheckCircle, BarChart3, Home, Vote, FileText, Check, AlertTriangle, BookOpen } from "lucide-react";
import CountdownTimer from "../Components/CountdownTimer";

interface VoterInfo {
  nin: string;
  state: string;
  dob: string;
  fullName: string;
}

interface Receipt {
  receiptToken?: string;
  selections?: Record<string, string>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [voter, setVoter] = useState<VoterInfo | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const voterNIN = sessionStorage.getItem("voterNIN");
    if (!voterNIN) {
      navigate("/login");
      return;
    }

    const storedInfo = getVoterInfo(voterNIN);
    setVoter({
      nin: voterNIN,
      state: sessionStorage.getItem("voterState") || "Lagos",
      dob: sessionStorage.getItem("voterDOB") || "1995-05-15",
      fullName: storedInfo?.fullName || "Registered Voter",
    });

    setHasVoted(votedVoters.has(voterNIN));
    setReceipt(getVoterReceipt(voterNIN));
  }, [navigate]);

  const getCandidateName = (position: string, id?: string) => {
    const candidateList = candidates[position];
    if (!candidateList) return id || "Unselected";
    const candidate = candidateList.find(c => c.id === id);
    return candidate ? candidate.name : id;
  };

  if (!voter) {
    return <div className="loading-state">Loading Voter Portal...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      {/* Election Countdown Banner */}
      <CountdownTimer onExpire={setIsExpired} className="dash-timer-banner" />

      {/* Welcome Banner */}
      <div className="dashboard-hero-banner">
        <div className="banner-left">
          <div className="voter-badge">
            <span className="status-dot green"></span> Validated Identity
          </div>
          <h1>Welcome back, {voter.fullName}!</h1>
          <p>Access your personalized ballot, review electoral participation status, and inspect cryptographically signed receipts.</p>
        </div>

        <div className="banner-action">
          {hasVoted ? (
            <div className="voted-status-card">
              <CheckCircle size={22} className="voted-icon" />
              <div>
                <span className="voted-title">Vote Completed</span>
                <span className="voted-sub">Token Receipt Available</span>
              </div>
            </div>
          ) : isExpired ? (
            <button className="btn-dash-primary disabled" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
              <AlertTriangle size={18} /> Polls Closed
            </button>
          ) : (
            <button className="btn-dash-primary" onClick={() => navigate("/ballot")}>
              <Vote size={18} /> Proceed to Ballot
            </button>
          )}
        </div>
      </div>


      {/* Grid Layout */}
      <div className="dashboard-grid">
        {/* Profile & Info */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3>Registered Credentials</h3>
            <span className="dash-card-tag">Verified</span>
          </div>

          <div className="info-pairs">
            <div className="pair-item">
              <span className="pair-label">Masked NIN</span>
              <span className="pair-value">{voter.nin.substring(0, 4)}****{voter.nin.substring(8)}</span>
            </div>
            <div className="pair-item">
              <span className="pair-label">State of Residence</span>
              <span className="pair-value">{voter.state}</span>
            </div>
            <div className="pair-item">
              <span className="pair-label">Date of Birth</span>
              <span className="pair-value">{voter.dob}</span>
            </div>
            <div className="pair-item">
              <span className="pair-label">Participation Status</span>
              <span className={`pair-status-tag ${hasVoted ? 'status-voted' : 'status-pending'}`}>
                {hasVoted ? (
                  <>
                    <Check size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Voted
                  </>
                ) : (
                  "Eligible to Vote"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Voting & Receipts */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3>Ballot & Verification</h3>
            <span className="dash-card-tag">Official</span>
          </div>

          {hasVoted ? (
            <div className="receipt-dash-content">
              <p className="receipt-note">Your vote has been recorded securely in the election database.</p>
              <div className="receipt-box-mini">
                <span className="receipt-label">Receipt Token:</span>
                <span className="receipt-code">{receipt?.receiptToken || "RCP-2024-VERIFIED"}</span>
              </div>
              <button className="btn-dash-outline" onClick={() => setShowReceiptModal(false)}>
                <FileText size={16} /> Inspect Vote Selections
              </button>
            </div>
          ) : (
            <div className="pending-vote-content">
              <p>You have not cast your ballot for the 2024 General Election yet.</p>
              <button className="btn-dash-primary" onClick={() => navigate("/ballot")}>
                <Vote size={18} /> Cast Your Ballot Now
              </button>
            </div>
          )}
        </div>

        {/* Election Status Stats */}
        <div className="dash-card full-width">
          <div className="dash-card-header">
            <h3>Election Summary & Quick Actions</h3>
            <span className="dash-card-tag">Real-Time</span>
          </div>

          <div className="quick-stats-row">
            <div className="quick-stat-box">
              <span className="qs-value">4</span>
              <span className="qs-label">Electoral Positions</span>
            </div>
            <div className="quick-stat-box">
              <span className="qs-value">12</span>
              <span className="qs-label">Approved Candidates</span>
            </div>
            <div className="quick-stat-box">
              <span className="qs-value">99.9%</span>
              <span className="qs-label">System Security Score</span>
            </div>
          </div>

          <div className="dash-actions-group">
            <button className="btn-action-tile" onClick={() => navigate("/guide")}>
              <BookOpen size={18} /> Election Guide & FAQs
            </button>
            <button className="btn-action-tile" onClick={() => navigate("/results")}>
              <BarChart3 size={18} /> View Live Election Results
            </button>
            <button className="btn-action-tile" onClick={() => navigate("/")}>
              <Home size={18} /> Portal Home
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Your Cryptographic Receipt</h2>
              <button className="close-btn" onClick={() => setShowReceiptModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-receipt-code">
                <span>Receipt Token:</span>
                <strong>{receipt?.receiptToken}</strong>
              </div>

              <h3>Your Selections</h3>
              <ul className="modal-selections-list">
                {receipt && Object.keys(receipt.selections || {}).map(pos => (
                  <li key={pos}>
                    <span className="pos-name">{pos.charAt(0).toUpperCase() + pos.slice(1)}:</span>
                    <span className="pos-cand">{getCandidateName(pos, receipt.selections![pos])}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
