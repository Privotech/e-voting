"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "../Utils/nextNavigation";
import axios from "axios";
import { registerVoter } from "../Utils/voterData";
import { CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getLockoutInfo, recordFailedAttempt, clearAttempts } from "../Utils/authSecurity";
import securityConfig from "../Utils/securityConfig";

interface FormData {
  fullName: string;
  nin: string;
  dob: string;
  state: string;
}

interface ValidationErrors {
  fullName?: string;
  nin?: string;
  dob?: string;
  state?: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    nin: "",
    dob: "",
    state: "",
  });
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const sanitized = name === "nin" ? value.replace(/[^0-9]/g, "").slice(0, 11) : value.replace(/[<>]/g, "").trim();
    setFormData((prev) => ({
      ...prev,
      [name]: sanitized,
    }));
    setError("");
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errors: ValidationErrors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    if (!formData.nin || formData.nin.length !== 11 || !/^\d+$/.test(formData.nin)) {
      errors.nin = "NIN must be exactly 11 numeric digits";
    }
    if (!formData.dob) {
      errors.dob = "Date of Birth is required";
    }
    if (!formData.state) {
      errors.state = "State of Residence is required";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fill in all required registration fields correctly.");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const response = await axios.post("/api/voters/register", formData);
      if (response.data && response.data.success) {
        setSuccess(true);
        clearAttempts("voter");
        toast.success("Voter profile registered successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 1800);
      } else {
        const msg = response.data?.message || "Registration failed.";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const localRes = registerVoter(formData.nin, formData.dob, formData.state, formData.fullName);
      if (localRes.success) {
        setSuccess(true);
        clearAttempts("voter");
        toast.success("Voter profile registered successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 1800);
      } else {
        const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || localRes.message || "An error occurred during registration.";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">Electoral Registry</div>
          <h1 className="auth-title">Voter Registration</h1>
          <p className="auth-subtitle">Register your National Identification Number to join the official voter roll.</p>
        </div>

        {success ? (
          <div className="auth-success-alert">
            <div className="success-icon"><CheckCircle size={32} /></div>
            <h3>Registration Successful!</h3>
            <p>Your voter profile has been created. Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="e.g. Samuel Adebayo"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                className={`form-input ${validationErrors.fullName ? "input-error" : ""}`}
              />
              {validationErrors.fullName && (
                <span className="field-error-msg"><AlertCircle size={14} /> {validationErrors.fullName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="nin">National Identification Number (NIN)</label>
              <input
                type="text"
                id="nin"
                name="nin"
                placeholder="11-digit NIN number"
                maxLength={11}
                value={formData.nin}
                onChange={handleChange}
                disabled={loading}
                className={`form-input ${validationErrors.nin ? "input-error" : ""}`}
              />
              {validationErrors.nin ? (
                <span className="field-error-msg"><AlertCircle size={14} /> {validationErrors.nin}</span>
              ) : (
                <span className="form-hint">NIN must be exactly 11 numeric digits.</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
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
                onChange={handleChange}
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

            {error && <div className="auth-error-alert">{error}</div>}

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? "Registering..." : "Complete Registration"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <span>Already registered?</span>
          <Link to="/login" className="auth-link">
            Log in to vote
          </Link>
        </div>
      </div>
    </div>
  );
}
