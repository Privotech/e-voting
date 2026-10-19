"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "../Utils/nextNavigation";
import { votedVoters, getVoterReceipt, getVoterInfo, candidates } from "../Utils/voterData";
import { POSITIONS, type ElectionPosition } from "../Utils/voterCandidates";
import type { VoterReceipt } from "../Utils/voterStateEngine";
import { CheckCircle, BarChart3, Home, Vote, FileText, Check, AlertTriangle, BookOpen } from "lucide-react";
import CountdownTimer from "../Components/CountdownTimer";

interface VoterInfo {
  nin: string;
  state: string;
  dob: string;
  fullName: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [voter, setVoter] = useState<VoterInfo | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [receipt, setReceipt] = useState<VoterReceipt | null>(null);
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

  const getCandidateName = (position: string, id?: string | null) => {
    if (!POSITIONS.includes(position as ElectionPosition)) return id || "Unselected";
    const candidateList = candidates[position as ElectionPosition];
    if (!candidateList) return id || "Unselected";
    const candidate = candidateList.find(c => c.id === id);
    return candidate ? candidate.name : id;
  };

  if (!voter) {
    return <div className="loading-state">Loading Voter Portal...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <CountdownTimer onExpire={setIsExpired} className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-sm)]" />

        <div className="flex flex-col gap-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-sm)] md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-bg)] px-3 py-1 text-xs font-bold text-[var(--primary-color)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]" />
              Validated Identity
            </div>
            <h1 className="text-3xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Welcome back, {voter.fullName}!
            </h1>
            <p className="text-sm text-[var(--text-muted)] sm:text-base">
              Access your personalized ballot, review electoral participation status, and inspect cryptographically signed receipts.
            </p>
          </div>

          <div className="flex-shrink-0">
            {hasVoted ? (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-400">
                <CheckCircle size={22} className="shrink-0" />
                <div>
                  <span className="block text-sm font-extrabold">Vote Completed</span>
                  <span className="block text-xs opacity-80">Token Receipt Available</span>
                </div>
              </div>
            ) : isExpired ? (
              <button disabled className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)]/60 px-5 py-3 text-sm font-extrabold text-white opacity-60 cursor-not-allowed">
                <AlertTriangle size={18} /> Polls Closed
              </button>
            ) : (
              <button onClick={() => navigate("/ballot")} className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[var(--primary-hover)] hover:-translate-y-0.5 shadow-[var(--shadow-sm)]">
                <Vote size={18} /> Proceed to Ballot
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-sm)]">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>Registered Credentials</h3>
              <span className="rounded-md bg-[var(--accent-bg)] px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-[var(--primary-color)]">
                Verified
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-dashed border-[var(--border-color)] py-3">
                <span className="text-sm font-semibold text-[var(--text-muted)]">Masked NIN</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">{voter.nin.substring(0, 4)}****{voter.nin.substring(8)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-dashed border-[var(--border-color)] py-3">
                <span className="text-sm font-semibold text-[var(--text-muted)]">State of Residence</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">{voter.state}</span>
              </div>
              <div className="flex items-center justify-between border-b border-dashed border-[var(--border-color)] py-3">
                <span className="text-sm font-semibold text-[var(--text-muted)]">Date of Birth</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">{voter.dob}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-semibold text-[var(--text-muted)]">Participation Status</span>
                <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${hasVoted ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                  {hasVoted ? (
                    <>
                      <Check size={14} className="inline" />
                      Voted
                    </>
                  ) : (
                    "Eligible to Vote"
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-sm)]">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>Ballot & Verification</h3>
              <span className="rounded-md bg-[var(--accent-bg)] px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-[var(--primary-color)]">
                Official
              </span>
            </div>

            {hasVoted ? (
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-muted)]">Your vote has been recorded securely in the election database.</p>
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-4">
                  <span className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Receipt Token</span>
                  <span className="mt-2 block font-mono text-base font-extrabold tracking-[0.06em] text-[var(--primary-color)]">
                    {receipt?.receiptToken || "RCP-2024-VERIFIED"}
                  </span>
                </div>
                <button onClick={() => setShowReceiptModal(false)} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-transparent px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] hover:bg-[var(--accent-bg)]">
                  <FileText size={16} /> Inspect Vote Selections
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-muted)]">You have not cast your ballot for the 2024 General Election yet.</p>
                <button onClick={() => navigate("/ballot")} className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[var(--primary-hover)] hover:-translate-y-0.5 shadow-[var(--shadow-sm)]">
                  <Vote size={18} /> Cast Your Ballot Now
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-sm)] md:col-span-2 xl:col-span-3">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>Election Summary & Quick Actions</h3>
              <span className="rounded-md bg-[var(--accent-bg)] px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-[var(--primary-color)]">
                Real-Time
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-5 text-center">
                <span className="block text-3xl font-extrabold text-[var(--primary-color)]" style={{ fontFamily: "var(--font-heading)" }}>4</span>
                <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Electoral Positions</span>
              </div>
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-5 text-center">
                <span className="block text-3xl font-extrabold text-[var(--primary-color)]" style={{ fontFamily: "var(--font-heading)" }}>12</span>
                <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Approved Candidates</span>
              </div>
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-5 text-center">
                <span className="block text-3xl font-extrabold text-[var(--primary-color)]" style={{ fontFamily: "var(--font-heading)" }}>99.9%</span>
                <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">System Security Score</span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <button onClick={() => navigate("/guide")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] hover:bg-[var(--accent-bg)]">
                <BookOpen size={18} /> Election Guide & FAQs
              </button>
              <button onClick={() => navigate("/results")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] hover:bg-[var(--accent-bg)]">
                <BarChart3 size={18} /> View Live Election Results
              </button>
              <button onClick={() => navigate("/")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] hover:bg-[var(--accent-bg)]">
                <Home size={18} /> Portal Home
              </button>
            </div>
          </div>
        </div>

        {showReceiptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowReceiptModal(false)}>
            <div className="w-full max-w-xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)]" onClick={(e) => e.stopPropagation()}>
              <div className="mb-5 flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h2 className="text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>Your Cryptographic Receipt</h2>
                <button className="text-2xl text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => setShowReceiptModal(false)}>&times;</button>
              </div>
              <div className="mb-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-4">
                <span className="block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Receipt Token</span>
                <strong className="mt-2 block break-all font-mono text-base font-extrabold text-[var(--primary-color)]">{receipt?.receiptToken}</strong>
              </div>

              <h3 className="mb-3 text-base font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>Your Selections</h3>
              <ul className="space-y-3">
                {receipt && Object.keys(receipt.selections || {}).map(pos => (
                  <li key={pos} className="flex items-center justify-between border-b border-dashed border-[var(--border-color)] pb-2 last:border-b-0">
                    <span className="text-sm font-bold text-[var(--text-muted)]">{pos.charAt(0).toUpperCase() + pos.slice(1)}:</span>
                    <span className="text-sm font-extrabold text-[var(--text-primary)]">{getCandidateName(pos, receipt.selections![pos])}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
