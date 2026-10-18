"use client";

import { useState } from "react";
import { Check, User, Info, Award, ShieldCheck } from "lucide-react";

export interface Candidate {
  id: string;
  name: string;
  party: string;
  partyShort: string;
  photo: string;
  runningMate?: string;
  position?: string;
  isVerified?: boolean;
  verificationLabel?: string;
  manifesto?: string;
  bio?: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  isSelected?: boolean;
  onSelect?: (candidateId: string) => void;
  isDisabled?: boolean;
  compact?: boolean;
  showDetailsToggle?: boolean;
  showVerificationBadge?: boolean;
}

export default function CandidateCard({
  candidate,
  isSelected = false,
  onSelect,
  isDisabled = false,
  compact = false,
  showDetailsToggle = false,
  showVerificationBadge = true,
}: CandidateCardProps) {
  const [imgError, setImgError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  if (!candidate) return null;

  const isVerified = candidate.isVerified !== false;
  const verificationText = candidate.verificationLabel || "INEC Clearance Verified";

  const handleClick = () => {
    if (!isDisabled && onSelect) {
      onSelect(candidate.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !isDisabled && onSelect) {
      e.preventDefault();
      onSelect(candidate.id);
    }
  };

  const initials = candidate.name
    ? candidate.name
        .split(" ")
        .filter((part) => part.length > 0)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "CD";

  return (
    <div
      className={`candidate-card-component ${isSelected ? "is-selected" : ""} ${
        isDisabled ? "is-disabled" : ""
      } ${compact ? "is-compact" : ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isDisabled ? -1 : 0}
      role="button"
      aria-pressed={isSelected}
      aria-disabled={isDisabled}
    >
      {isSelected && (
        <div className="card-selected-ribbon">
          <Check size={14} strokeWidth={3} />
          <span>Selected Choice</span>
        </div>
      )}

      <div className="card-content-inner">
        <div className="avatar-wrapper">
          {!imgError && candidate.photo ? (
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="candidate-avatar"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="candidate-avatar-fallback">
              {initials ? initials : <User size={24} />}
            </div>
          )}
          {candidate.partyShort && (
            <span className="party-badge-chip">{candidate.partyShort}</span>
          )}
        </div>

        <div className="candidate-details">
          <div className="candidate-name-row">
            <h3 className="candidate-name">{candidate.name}</h3>
            {showVerificationBadge && isVerified && (
              <span
                className="verification-status-badge"
                title="Passed security and background clearance checks"
              >
                <ShieldCheck size={13} className="verified-shield-icon" />
                <span className="verified-text-pill">Cleared</span>
              </span>
            )}
          </div>

          <p className="candidate-party-full">{candidate.party}</p>
          
          {candidate.runningMate && (
            <p className="candidate-running-mate">
              <small>Running Mate:</small> {candidate.runningMate}
            </p>
          )}

          <div className="candidate-meta-tags">
            {candidate.position && (
              <span className="candidate-pos-tag">
                <Award size={11} /> {candidate.position}
              </span>
            )}

            {showVerificationBadge && isVerified && (
              <span className="candidate-verified-banner">
                <ShieldCheck size={11} /> {verificationText}
              </span>
            )}
          </div>
        </div>

        <div className="selection-action-box">
          <div className={`custom-checkbox-circle ${isSelected ? "checked" : ""}`}>
            {isSelected && <Check size={16} strokeWidth={3} />}
          </div>
        </div>
      </div>

      {showDetailsToggle && (candidate.manifesto || candidate.bio) && (
        <div className="candidate-extra-drawer">
          <button
            type="button"
            className="btn-toggle-info"
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(!showInfo);
            }}
          >
            <Info size={13} /> {showInfo ? "Hide Manifesto" : "Read Manifesto"}
          </button>

          {showInfo && (
            <div className="manifesto-text-box">
              <p>{candidate.manifesto || candidate.bio}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
