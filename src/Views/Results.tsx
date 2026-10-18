"use client";

import { useEffect, useState } from "react";
import {
  getPositionResults,
  getTurnoutStats,
  areResultsVisible,
  toggleResultsVisibility,
} from "../Utils/voterData";
import ResultsHeader from "./Results/ResultsHeader";
import ResultsPositionSection from "./Results/ResultsPositionSection";
import ResultsStateTurnout from "./Results/ResultsStateTurnout";
import ResultsAuditCertificate from "./Results/ResultsAuditCertificate";
import { Lock, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

interface PositionResult {
  id: string;
  name: string;
  party: string;
  partyShort: string;
  photo: string;
  votes: number;
}

export interface TurnoutStats {
  totalVoted: number;
  totalRegistered: number;
  turnoutPercentage: string | number;
}

export type { PositionResult };

export default function Results() {
  const [positionResults, setPositionResults] = useState<Record<string, PositionResult[]> | null>(null);
  const [turnout, setTurnout] = useState<TurnoutStats | null>(null);
  const [isVisible, setIsVisible] = useState(areResultsVisible());
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    loadResults();
    const interval = setInterval(loadResults, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadResults = () => {
    const positions = ["president", "governor", "senator", "houseOfReps"];
    const results: Record<string, PositionResult[]> = {};
    positions.forEach((pos) => {
      results[pos] = getPositionResults(pos);
    });
    setPositionResults(results);
    setTurnout(getTurnoutStats());
    setIsVisible(areResultsVisible());
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminPassword("");
      toast.success("Admin mode unlocked.");
    } else {
      toast.error("Invalid admin password");
      setAdminPassword("");
    }
  };

  const handleToggleVisibility = () => {
    toggleResultsVisibility();
    setIsVisible(!isVisible);
    toast.success(areResultsVisible() ? "Results published!" : "Results hidden!");
  };

  if (!positionResults || !turnout) {
    return <div className="loading">Loading election results...</div>;
  }

  const positionsList = [
    { key: "president", title: "Presidential Election" },
    { key: "governor", title: "Gubernatorial Election" },
    { key: "senator", title: "Senatorial Election" },
    { key: "houseOfReps", title: "House of Representatives Election" },
  ];

  return (
    <div className="results-page-wrapper">
      <div className="results-container">
        <ResultsHeader
          isAdmin={isAdmin}
          isVisible={isVisible}
          onShowAdminModal={() => setShowAdminModal(true)}
          onToggleVisibility={handleToggleVisibility}
          onExitAdmin={() => setIsAdmin(false)}
        />

        {!isVisible && !isAdmin ? (
          <div className="results-hidden-banner">
            <EyeOff size={24} />
            <div>
              <h3>Results Are Currently Locked</h3>
              <p>Official poll results will be published live immediately after voting closes.</p>
            </div>
          </div>
        ) : (
          <>
            <ResultsStateTurnout turnout={turnout} />

            <div className="positions-grid-layout">
              {positionsList.map(({ key, title }) => (
                <ResultsPositionSection
                  key={key}
                  title={title}
                  candidates={positionResults[key] || []}
                  totalVotes={turnout.totalVoted}
                />
              ))}
            </div>

            <ResultsAuditCertificate totalVotes={turnout.totalVoted} />
          </>
        )}

        {/* Admin Login Modal */}
        {showAdminModal && (
          <div className="modal-overlay" onClick={() => setShowAdminModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <Lock size={20} />
                <h2>Electoral Admin Mode</h2>
              </div>
              <form onSubmit={handleAdminLogin}>
                <input
                  type="password"
                  placeholder="Enter admin passcode (admin123)..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoFocus
                />
                <div className="modal-buttons">
                  <button type="button" onClick={() => setShowAdminModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Unlock Mode
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
