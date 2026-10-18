import { useNavigate } from "../../Utils/nextNavigation";
import {
  KeyRound,
  Lock,
  FileText,
  Eye,
  Award,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Info
} from "lucide-react";

export default function GuideProcedureTab() {
  const navigate = useNavigate();

  return (
    <div className="guide-tab-content">
      <div className="section-header-block">
        <h2>Official 5-Step Voting Workflow</h2>
        <p>Follow these quick, standardized steps to ensure your vote is cast cleanly and securely.</p>
      </div>

      <div className="procedure-timeline">
        {/* Step 1 */}
        <div className="procedure-card">
          <div className="step-number-badge">Step 1</div>
          <div className="step-card-body">
            <div className="step-icon-box">
              <KeyRound size={22} />
            </div>
            <div className="step-text">
              <h3>Voter Authentication & Identity Check</h3>
              <p>
                Log in using your registered <strong>National Identification Number (NIN)</strong> or <strong>Voter Identification Number (VIN)</strong> along with your secure account passcode.
              </p>
              <div className="step-tip">
                <Info size={14} /> Tip: Ensure your credentials match your INEC voter registration card details.
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="procedure-card">
          <div className="step-number-badge">Step 2</div>
          <div className="step-card-body">
            <div className="step-icon-box">
              <Lock size={22} />
            </div>
            <div className="step-text">
              <h3>Token Generation & Ballot Access</h3>
              <p>
                Upon identity verification, the system issues a single-use <strong>Authorization Token</strong>. This token unlocks your official digital ballot corresponding to your designated state and constituency.
              </p>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="procedure-card">
          <div className="step-number-badge">Step 3</div>
          <div className="step-card-body">
            <div className="step-icon-box">
              <FileText size={22} />
            </div>
            <div className="step-text">
              <h3>Candidate Selection & Ballot Marking</h3>
              <p>
                Review candidates across available executive and legislative offices (e.g. Presidential, Gubernatorial, Senate). Select your preferred candidate or tap &quot;Abstain&quot; for any position.
              </p>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="procedure-card">
          <div className="step-number-badge">Step 4</div>
          <div className="step-card-body">
            <div className="step-icon-box">
              <Eye size={22} />
            </div>
            <div className="step-text">
              <h3>Pre-Submission Review & Cryptographic Seal</h3>
              <p>
                Carefully verify your selections on the Review page. Once satisfied, click <strong>&quot;Cryptographically Seal &amp; Submit Ballot&quot;</strong>.
              </p>
              <div className="step-tip alert-tip">
                <AlertCircle size={14} /> Notice: After final confirmation, choices cannot be changed.
              </div>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="procedure-card">
          <div className="step-number-badge">Step 5</div>
          <div className="step-card-body">
            <div className="step-icon-box">
              <Award size={22} />
            </div>
            <div className="step-text">
              <h3>Receipt Download & Immutable Log Record</h3>
              <p>
                Your ballot is recorded onto the SHA-256 block ledger. Download or save your official <strong>Digital Voting Receipt</strong> containing your audit hash for personal verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="procedure-callout-box">
        <div className="callout-icon">
          <ShieldCheck size={28} />
        </div>
        <div className="callout-text">
          <h4>Ready to Participate?</h4>
          <p>Voting polls close at 18:00 WAT. Make sure your vote is registered on time.</p>
        </div>
        <button onClick={() => navigate("/ballot")} className="btn-callout">
          Go to Ballot Page <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
