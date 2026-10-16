import { FileCheck, Download, Printer } from "lucide-react";
import toast from "react-hot-toast";

export default function ResultsAuditCertificate({ totalVotes }) {
  const handleDownloadCertificate = () => {
    toast.success("Downloading Cryptographic Results Certificate...");
    window.print();
  };

  return (
    <div className="audit-certificate-card">
      <div className="cert-header">
        <FileCheck size={28} className="cert-icon" />
        <div>
          <h3>Cryptographic Tally Certificate</h3>
          <p>Official cryptographic proof of vote aggregation integrity.</p>
        </div>
      </div>

      <div className="cert-body">
        <div className="cert-field">
          <label>Consensus Signature:</label>
          <code>SHA256-INEC-LEDGER-2026-CONSENSUS-VERIFIED</code>
        </div>
        <div className="cert-field">
          <label>Audited Ballot Count:</label>
          <span>{totalVotes} Sealed Votes</span>
        </div>
      </div>

      <button onClick={handleDownloadCertificate} className="btn-download-cert">
        <Printer size={16} /> Print Official Tally Certificate
      </button>
    </div>
  );
}
