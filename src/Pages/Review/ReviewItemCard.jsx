import { Edit3 } from "lucide-react";

export default function ReviewItemCard({ title, candidate, onEdit }) {
  if (!candidate) return null;

  return (
    <section className="review-section">
      <h3>{title}</h3>
      <div className="selected-candidate">
        <img src={candidate.photo} alt={candidate.name} />
        <div className="candidate-details">
          <h4>{candidate.name}</h4>
          <p className="party">{candidate.party}</p>
        </div>
        <button className="btn-edit-selection" onClick={onEdit} title="Edit selections">
          <Edit3 size={14} style={{ marginRight: "4px" }} />
          Edit
        </button>
      </div>
    </section>
  );
}
