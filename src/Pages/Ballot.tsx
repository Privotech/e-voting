"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "../Utils/nextNavigation";
import { candidates } from "../Utils/voterData";
import useBallotStore from "../store/ballotStore";
import CountdownTimer from "../Components/CountdownTimer";
import BallotPositionSection from "./Ballot/BallotPositionSection";
import toast from "react-hot-toast";

interface Voter {
  nin: string;
  state: string | null;
}

export default function Ballot() {
  const navigate = useNavigate();
  const { selections, selectCandidate, checkDoubleVoting } = useBallotStore();
  const [voter, setVoter] = useState<Voter | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const voterNIN = sessionStorage.getItem("voterNIN");
    if (!voterNIN) {
      navigate("/login");
      return;
    }

    setVoter({
      nin: voterNIN,
      state: sessionStorage.getItem("voterState"),
    });

    checkDoubleVoting(voterNIN).then((res) => {
      if (res.hasVoted) {
        toast.error("You have already voted! Redirecting to dashboard...");
        navigate("/dashboard");
      }
    });

    const savedSelections = sessionStorage.getItem("ballotSelections");
    if (savedSelections) {
      const parsed = JSON.parse(savedSelections);
      Object.keys(parsed).forEach((pos) => {
        if (parsed[pos]) selectCandidate(pos, parsed[pos]);
      });
    }
  }, [navigate, checkDoubleVoting, selectCandidate]);

  const handleCandidateSelect = (position: string, candidateId: string) => {
    if (isExpired) {
      toast.error("Polls are closed. Voting is disabled.");
      return;
    }

    selectCandidate(position, candidateId);
    const updatedSelections = { ...selections, [position]: candidateId };
    sessionStorage.setItem("ballotSelections", JSON.stringify(updatedSelections));
  };

  const getSelectedCandidate = (position: string) => {
    if (!selections[position]) return null;
    return candidates[position]?.find((c) => c.id === selections[position]);
  };

  const allPositionsSelected =
    selections.president &&
    selections.governor &&
    selections.senator &&
    selections.houseOfReps;

  const handleReviewSubmit = () => {
    if (isExpired) {
      toast.error("Election polling window has closed.");
      return;
    }

    if (!allPositionsSelected) {
      const missing = [];
      if (!selections.president) missing.push("President");
      if (!selections.governor) missing.push("Governor");
      if (!selections.senator) missing.push("Senator");
      if (!selections.houseOfReps) missing.push("House of Reps");
      toast.error(`Incomplete ballot: Please select a candidate for ${missing.join(", ")}`);
      return;
    }

    toast.success("Selections saved! Proceeding to review...");
    navigate("/review");
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  if (!voter) {
    return <div className="loading">Loading ballot...</div>;
  }

  const sections = [
    { key: "president", title: "President" },
    { key: "governor", title: "Governor" },
    { key: "senator", title: "Senator" },
    { key: "houseOfReps", title: "House of Representatives" },
  ];

  return (
    <div className="ballot-container">
      <header className="ballot-header">
        <div className="header-content">
          <h1>Cast Your Vote</h1>
          <p>Election {new Date().getFullYear()}</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="ballot-main">
        <CountdownTimer onExpire={setIsExpired} />

        <div className="ballot-progress" style={{ marginTop: "1rem" }}>
          {sections.map(({ key, title }) => (
            <div key={key} className="progress-item">
              <span className={selections[key] ? "done" : ""}>{title}</span>
            </div>
          ))}
        </div>

        {sections.map(({ key, title }) => (
          <BallotPositionSection
            key={key}
            title={title}
            positionKey={key}
            candidatesList={candidates[key]}
            selectedId={selections[key]}
            selectedCandidateName={getSelectedCandidate(key)?.name}
            onSelect={handleCandidateSelect}
            isExpired={isExpired}
          />
        ))}

        <div className="ballot-actions">
          <button
            className={`btn-submit-ballot ${allPositionsSelected ? "ready" : ""}`}
            onClick={handleReviewSubmit}
            disabled={isExpired}
          >
            Review & Seal Ballot
          </button>
        </div>
      </main>
    </div>
  );
}
