"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "../Utils/nextNavigation";
import { candidates } from "../Utils/voterData";
import useBallotStore from "../store/ballotStore";
import ReviewItemCard from "./Review/ReviewItemCard";
import toast from "react-hot-toast";

interface Selections {
  president?: string;
  governor?: string;
  senator?: string;
  houseOfReps?: string;
}

export default function Review() {
  const navigate = useNavigate();
  const [selections, setSelections] = useState<Selections | null>(null);
  const [voter, setVoter] = useState<string | null>(null);
  const { submitBallot, isSubmitting, checkDoubleVoting } = useBallotStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const voterNIN = sessionStorage.getItem("voterNIN");
    if (!voterNIN) {
      toast.error("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    const ballotSelections = sessionStorage.getItem("ballotSelections");
    if (!ballotSelections) {
      toast.error("No ballot selections found.");
      navigate("/ballot");
      return;
    }

    setVoter(voterNIN);
    const parsedSelections = JSON.parse(ballotSelections);
    setSelections(parsedSelections);

    checkDoubleVoting(voterNIN).then((check) => {
      if (check.hasVoted) {
        setError(check.message);
        toast.error("You have already cast a vote.");
      }
    });
  }, [navigate, checkDoubleVoting]);

  const getSelectedCandidateInfo = (position: string, candidateId?: string) => {
    return candidates[position]?.find((c) => c.id === candidateId);
  };

  const handleCastVote = async () => {
    setError(null);

    if (!voter) return;

    const result = await submitBallot(voter);

    if (result.success) {
      sessionStorage.removeItem("ballotSelections");
      sessionStorage.setItem("receiptToken", result.receiptToken);
      toast.success("Vote cryptographically cast and verified!");
      navigate("/confirmation");
    } else {
      setError(result.message);
      toast.error(result.message || "Failed to submit ballot.");
    }
  };

  const handleEdit = () => {
    navigate("/ballot");
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  if (!selections || !voter) {
    return <div className="loading">Loading review...</div>;
  }

  const reviewItems = [
    { key: "president", title: "President" },
    { key: "governor", title: "Governor" },
    { key: "senator", title: "Senator" },
    { key: "houseOfReps", title: "House of Representatives" },
  ];

  return (
    <div className="review-container">
      <header className="review-header">
        <div className="header-content">
          <h1>Review Your Vote</h1>
          <p>Please verify your choices before cryptographically sealing your ballot</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="review-main">
        {error && <div className="error-message">{error}</div>}

        <div className="review-content">
          {reviewItems.map(({ key, title }) => (
            <ReviewItemCard
              key={key}
              title={title}
              candidate={getSelectedCandidateInfo(key, selections[key])}
              onEdit={handleEdit}
            />
          ))}
        </div>

        <div className="review-warning">
          <p>
            <strong>Important:</strong> Once you confirm and submit, your vote will be sealed into the cryptographic ledger and cannot be changed.
          </p>
        </div>

        <div className="review-actions">
          <button className="btn-edit-all" onClick={handleEdit} disabled={isSubmitting}>
            Change Selections
          </button>
          <button
            className="btn-confirm-submit"
            onClick={handleCastVote}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sealing Vote..." : "Cryptographically Seal & Submit Ballot"}
          </button>
        </div>
      </main>
    </div>
  );
}
