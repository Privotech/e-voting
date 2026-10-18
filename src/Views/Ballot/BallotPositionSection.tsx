import CandidateCard from "../../Components/CandidateCard";
import { Check } from "lucide-react";
import type { ElectionPosition, LocalCandidate } from "../../Utils/voterCandidates";

interface BallotPositionSectionProps {
  title: string;
  positionKey: ElectionPosition;
  candidatesList?: LocalCandidate[];
  selectedId: string | null;
  selectedCandidateName?: string;
  onSelect: (position: ElectionPosition, candidateId: string) => void;
  isExpired: boolean;
}

export default function BallotPositionSection({
  title,
  positionKey,
  candidatesList = [],
  selectedId,
  selectedCandidateName,
  onSelect,
  isExpired
}: BallotPositionSectionProps) {
  return (
    <section className="position-section">
      <div className="position-header">
        <h2>{title}</h2>
        {selectedId && (
          <div className="selection-badge">
            <Check size={12} style={{ marginRight: "4px" }} />
            {selectedCandidateName}
          </div>
        )}
      </div>

      <div className="candidates-grid">
        {candidatesList.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isSelected={selectedId === candidate.id}
            onSelect={(id) => onSelect(positionKey, id)}
            isDisabled={isExpired}
            showDetailsToggle={true}
          />
        ))}
      </div>
    </section>
  );
}
