"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "../Utils/nextNavigation";
import useVoterStore from "../store/voterStore";
import { Zap, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getLockoutInfo, recordFailedAttempt, clearAttempts } from "../Utils/authSecurity";
import securityConfig from "../Utils/securityConfig";

interface FormData {
  nin: string;
  dob: string;
  state: string;
}

interface ValidationErrors {
  nin?: string;
  dob?: string;
  state?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login, error, loading } = useVoterStore();
  const [formData, setFormData] = useState<FormData>({
    nin: "",
    dob: "",
    state: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [remainingAttempts, setRemainingAttempts] = useState(securityConfig.maxLoginAttempts);

  useEffect(() => {
    const lockout = getLockoutInfo();
    if (lockout) {
      setRemainingAttempts(0);
    } else {
      setRemainingAttempts(securityConfig.maxLoginAttempts);
    }
  }, []);

  const fillDemoAccount = (nin: string, dob: string, state: string) => {
    setFormData({ nin, dob, state });
    setValidationErrors({});
    if (securityConfig.isDemo) {
      toast.success("Demo credentials loaded");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nin, dob, state } = formData;

    const errors: ValidationErrors = {};
    if (!nin || nin.trim().length !== 11 || !/^\d+$/.test(nin.trim())) {
      errors.nin = "NIN must be exactly 11 numeric digits";
    }
    if (!dob) {
      errors.dob = "Date of Birth is required";
    }
    if (!state) {
      errors.state = "State of Residence is required";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the validation errors in the form.");
      return;
    }

    const result = await login(nin, dob, state);

    if (result && result.success) {
      clearAttempts("voter");
      toast.success("Voter authentication successful!");
      navigate("/dashboard");
    } else {
      const attemptResult = recordFailedAttempt("voter");
      setRemainingAttempts(Math.max(0, securityConfig.maxLoginAttempts - (attemptResult.locked ? securityConfig.maxLoginAttempts : attemptResult.remainingAttempts + 1)));
      toast.error(result?.message || "Authentication failed. Invalid details.");
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">Secure Authentication</div>
          <h1 className="auth-title">Voter Identification</h1>
          <p className="auth-subtitle">Verify your National Identification details to access your official ballot.</p>
        </div>

        {securityConfig.isDemo && (
          <div className="demo-credentials-box">
            <span className="demo-title">
              <Zap size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
              Quick Demo Login:
            </span>
            <div className="demo-chips">
              <button
                type="button"
                className="demo-chip"
                onClick={() => fillDemoAccount("12345678901", "1995-05-15", "Lagos")}
              >
                Demo Voter (Lagos)
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => fillDemoAccount("98765432101", "1990-08-20", "FCT")}
              >
                Test Voter (FCT)
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nin">National Identification Number (NIN)</label>
            <input
              type="text"
              id="nin"
              name="nin"
              placeholder="e.g. 12345678901"
              maxLength={11}
              value={formData.nin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setFormData((prev) => ({ ...prev, nin: val }));
                if (validationErrors.nin) setValidationErrors((prev) => ({ ...prev, nin: undefined }));
              }}
              disabled={loading}
              className={`form-input ${validationErrors.nin ? "input-error" : ""}`}
            />
            {validationErrors.nin ? (
              <span className="field-error-msg"><AlertCircle size={14} /> {validationErrors.nin}</span>
            ) : (
              <span className="form-hint">Must be an 11-digit registered NIN.</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, dob: e.target.value }));
                if (validationErrors.dob) setValidationErrors((prev) => ({ ...prev, dob: undefined }));
              }}
              disabled={loading}
              className={`form-input ${validationErrors.dob ? "input-error" : ""}`}
            />
            {validationErrors.dob && (
              <span className="field-error-msg"><AlertCircle size={14} /> {validationErrors.dob}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="state">State of Residence</label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, state: e.target.value }));
                if (validationErrors.state) setValidationErrors((prev) => ({ ...prev, state: undefined }));
              }}
              disabled={loading}
              className={`form-select ${validationErrors.state ? "input-error" : ""}`}
            >
              <option value="">Select your state...</option>
              {["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT"].map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            {validationErrors.state && (
              <span className="field-error-msg"><AlertCircle size={14} /> {validationErrors.state}</span>
            )}
          </div>

          {!getLockoutInfo() && remainingAttempts < securityConfig.maxLoginAttempts && (
            <div className="auth-attempts-warning">
              {remainingAttempts > 0
                ? `${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining before temporary lockout.`
                : "Final attempt before lockout."}
            </div>
          )}

          {getLockoutInfo() && (
            <div className="auth-error-alert" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", padding: "0.75rem", color: "#ef4444" }}>
              Too many failed login attempts. Please wait before trying again.
            </div>
          )}

          {error && <div className="auth-error-alert">{error}</div>}

          <button type="submit" className="btn-auth-submit" disabled={loading || !!getLockoutInfo()}>
            {loading ? <span className="btn-spinner"></span> : "Authenticate & Continue"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Not registered yet?</span>
          <Link to="/signup" className="auth-link">
            Register for a Voter ID
          </Link>
        </div>
      </div>
    </div>
  );
}
