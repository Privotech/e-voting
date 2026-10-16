import { useState } from "react";
import { candidates } from "../../../Utils/voterData";
import { Plus, Edit3, Award, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCandidateMgmtTab({
  rosterVersion,
  onUpdateCandidate,
  onAddNewCandidate
}) {
  const [selectedPos, setSelectedPos] = useState("president");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  const [newForm, setNewForm] = useState({
    name: "",
    party: "",
    partyShort: "",
    photo: ""
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newForm.name || !newForm.party) {
      toast.error("Candidate Name and Party Title are required.");
      return;
    }

    onAddNewCandidate(selectedPos, newForm);
    setNewForm({ name: "", party: "", partyShort: "", photo: "" });
    setShowAddModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingCandidate) return;

    onUpdateCandidate(selectedPos, editingCandidate.id, {
      name: editingCandidate.name,
      party: editingCandidate.party,
      partyShort: editingCandidate.partyShort
    });
    setEditingCandidate(null);
  };

  const currentCandidates = candidates[selectedPos] || [];

  return (
    <div className="admin-tab-content" key={rosterVersion}>
      <div className="section-card-header">
        <div>
          <h3>Candidate Roster & Credential Management</h3>
          <p>Review, modify, or accredit certified candidates across contested positions.</p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-add-primary">
          <Plus size={16} /> Add New Candidate
        </button>
      </div>

      <div className="pos-tab-pills">
        {["president", "governor", "senator", "houseOfReps"].map((pos) => (
          <button
            key={pos}
            className={`pos-pill ${selectedPos === pos ? "active" : ""}`}
            onClick={() => setSelectedPos(pos)}
          >
            {pos === "houseOfReps" ? "House of Reps" : pos.charAt(0).toUpperCase() + pos.slice(1)}
          </button>
        ))}
      </div>

      <div className="candidate-admin-grid">
        {currentCandidates.map((c) => (
          <div key={c.id} className="candidate-admin-card">
            <img src={c.photo} alt={c.name} className="c-photo" />
            <div className="c-info">
              <div className="c-name-row">
                <h4>{c.name}</h4>
                <span className="clearance-badge" title="INEC Security Clearance Verified">
                  <ShieldCheck size={12} /> Cleared
                </span>
              </div>
              <p className="c-party">{c.party} ({c.partyShort})</p>
              <p className="c-id">ID: <code>{c.id}</code></p>
            </div>
            <button
              className="btn-edit-c"
              onClick={() => setEditingCandidate({ ...c })}
            >
              <Edit3 size={15} /> Edit
            </button>
          </div>
        ))}
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Add Candidate ({selectedPos})</h3>
            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-group">
                <label>Candidate Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Samuel Okafor"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Political Party</label>
                <input
                  type="text"
                  placeholder="e.g. Progressive Congress"
                  value={newForm.party}
                  onChange={(e) => setNewForm({ ...newForm, party: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Party Short Code</label>
                <input
                  type="text"
                  placeholder="e.g. PC"
                  value={newForm.partyShort}
                  onChange={(e) => setNewForm({ ...newForm, partyShort: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-modal-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-modal-confirm">
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Candidate Modal */}
      {editingCandidate && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Edit Candidate ({editingCandidate.id})</h3>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label>Candidate Full Name</label>
                <input
                  type="text"
                  value={editingCandidate.name}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Political Party</label>
                <input
                  type="text"
                  value={editingCandidate.party}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, party: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Party Short Code</label>
                <input
                  type="text"
                  value={editingCandidate.partyShort}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, partyShort: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingCandidate(null)} className="btn-modal-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-modal-confirm">
                  Update Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
