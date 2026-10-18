"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "../../Utils/nextNavigation";
import useAdminStore from "../../store/adminStore";
import {
  votedVoters,
  candidates,
  getTurnoutStats,
  getPositionResults,
  resetVotesToBaseline,
  updateCandidateDetails,
  addNewCandidate
} from "../../Utils/voterData";
import { generateBatchVoterTokens } from "../../Utils/voterTokenUtils";
import type { ElectionPosition, LocalCandidate, NewCandidate } from "../../Utils/voterCandidates";
import { getAuditLogs, appendAuditLog, verifyChainIntegrity, exportAuditCertificate } from "../../Utils/auditLogUtils";
import AdminHeader from "./components/AdminHeader";
import AdminOverviewTab from "./components/AdminOverviewTab";
import AdminTurnoutTab from "./components/AdminTurnoutTab";
import AdminCandidateMgmtTab from "./components/AdminCandidateMgmtTab";
import AdminAuditLogsTab from "./components/AdminAuditLogsTab";
import AdminVoterTokensTab from "./components/AdminVoterTokensTab";
import { BarChart3, Vote, Award, ShieldCheck, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

type TabId = "overview" | "turnout" | "candidates" | "logs" | "tokens";

interface ChartData {
  name: string;
  shortName: string;
  party: string;
  votes: number;
  fill: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { admin, adminLogout } = useAdminStore();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [pollsActive, setPollsActive] = useState(true);
  const [chartPosition, setChartPosition] = useState<ElectionPosition>("president");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [auditLogs, setAuditLogs] = useState(() => getAuditLogs());
  const [chainIntegrity, setChainIntegrity] = useState(() => verifyChainIntegrity());

  const [rosterVersion, setRosterVersion] = useState(0);

  const [generatedTokens, setGeneratedTokens] = useState(() => generateBatchVoterTokens(5, "Lagos"));

  const turnout = getTurnoutStats();
  const totalRegistered = 2400 + votedVoters.size;
  const totalVoted = votedVoters.size;
  const totalCandidates =
    candidates.president.length +
    candidates.governor.length +
    candidates.senator.length +
    candidates.houseOfReps.length;

  useEffect(() => {
    const res = getPositionResults(chartPosition);
    setChartData(
      res.map((c) => ({
        name: c.name,
        shortName: `${c.name.split(" ")[0]} (${c.partyShort})`,
        party: c.partyShort,
        votes: c.votes,
        fill: c.partyShort === "DP" ? "#3b82f6" : c.partyShort === "RP" ? "#ef4444" : "#10b981"
      }))
    );
  }, [chartPosition, totalVoted, rosterVersion]);

  const refreshLogs = () => {
    setAuditLogs([...getAuditLogs()]);
    setChainIntegrity(verifyChainIntegrity());
  };

  const handleLogout = () => {
    adminLogout();
    toast.success("Logged out of Administrative Portal.");
    navigate("/xadmin/login");
  };

  const handleTogglePolls = () => {
    const nextState = !pollsActive;
    setPollsActive(nextState);
    appendAuditLog({
      category: "Election Settings",
      action: "ELECTION_STATUS_CHANGE",
      actor: "Chief Electoral Officer",
      details: nextState ? "Polls manually RESUMED." : "EMERGENCY: Polls manually PAUSED."
    });
    refreshLogs();
    if (nextState) toast.success("Polls manually resumed");
    else toast.error("Emergency: Polls manually paused!");
  };

  const handleResetVotes = () => {
    resetVotesToBaseline(2);
    setShowResetConfirm(false);
    appendAuditLog({
      category: "System Resets",
      action: "BASELINE_RESET",
      actor: "Electoral Systems Administrator",
      details: "Restored candidate vote tallies to baseline 2 votes."
    });
    refreshLogs();
    toast.success("All candidate vote tallies restored to baseline 2 votes!");
  };

  const handleExportCSV = () => {
    const rows = [
      ["=== ELECTORAL COMMISSION OFFICIAL REPORT ==="],
      ["Generated At", new Date().toLocaleString() + " WAT"],
      ["Total Registered Voters", totalRegistered],
      ["Total Ballots Cast", totalVoted],
      ["Voter Turnout Rate", `${turnout.turnoutPercentage}%`],
      [""],
      ["POSITION", "CANDIDATE ID", "CANDIDATE NAME", "PARTY", "VOTES"],
    ];

    Object.keys(candidates).forEach((pos) => {
      getPositionResults(pos).forEach((c) => {
        rows.push([pos.toUpperCase(), c.id, c.name, c.party, c.votes]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map((cell) => `"${cell}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `election_results_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Election results report CSV exported!");
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleUpdateCandidate = (pos: string, id: string, fields: Partial<LocalCandidate>) => {
    updateCandidateDetails(pos, id, fields);
    setRosterVersion((v) => v + 1);
    toast.success("Candidate details updated successfully!");
  };

  const handleAddNewCandidate = (pos: string, data: NewCandidate) => {
    addNewCandidate(pos, data);
    setRosterVersion((v) => v + 1);
    toast.success("New candidate added successfully!");
  };

  const handleGenerateTokensBatch = (count: number, state: string) => {
    const newBatch = generateBatchVoterTokens(count, state);
    setGeneratedTokens((prev) => [...newBatch, ...prev]);
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-container">
        <AdminHeader
          admin={admin}
          pollsActive={pollsActive}
          onTogglePolls={handleTogglePolls}
          onLogout={handleLogout}
        />

        {/* Tab Buttons */}
        <div className="admin-nav-tabs">
          <button
            className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <BarChart3 size={16} /> Overview
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "turnout" ? "active" : ""}`}
            onClick={() => setActiveTab("turnout")}
          >
            <Vote size={16} /> Turnout
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "candidates" ? "active" : ""}`}
            onClick={() => setActiveTab("candidates")}
          >
            <Award size={16} /> Candidates
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "logs" ? "active" : ""}`}
            onClick={() => setActiveTab("logs")}
          >
            <ShieldCheck size={16} /> Audit Ledger
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "tokens" ? "active" : ""}`}
            onClick={() => setActiveTab("tokens")}
          >
            <KeyRound size={16} /> Voter Tokens
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-main-view">
          {activeTab === "overview" && (
            <AdminOverviewTab
              turnout={turnout}
              totalRegistered={totalRegistered}
              totalVoted={totalVoted}
              totalCandidates={totalCandidates}
              chartPosition={chartPosition}
              setChartPosition={setChartPosition}
              chartData={chartData}
              onResetVotes={handleResetVotes}
              onExportCSV={handleExportCSV}
              onPrintPDF={handlePrintPDF}
              showResetConfirm={showResetConfirm}
              setShowResetConfirm={setShowResetConfirm}
            />
          )}

          {activeTab === "turnout" && (
            <AdminTurnoutTab onExportCSV={handleExportCSV} />
          )}

          {activeTab === "candidates" && (
            <AdminCandidateMgmtTab
              rosterVersion={rosterVersion}
              onUpdateCandidate={handleUpdateCandidate}
              onAddNewCandidate={handleAddNewCandidate}
            />
          )}

          {activeTab === "logs" && (
            <AdminAuditLogsTab
              auditLogs={auditLogs}
              chainIntegrity={chainIntegrity}
              onExportAuditCertificate={exportAuditCertificate}
            />
          )}

          {activeTab === "tokens" && (
            <AdminVoterTokensTab
              generatedTokens={generatedTokens}
              onGenerateBatch={handleGenerateTokensBatch}
            />
          )}
        </div>
      </div>
    </div>
  );
}
