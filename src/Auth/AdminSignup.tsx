"use client";

import { useState } from "react";
import { useNavigate, Link } from "../Utils/nextNavigation";
import useAdminStore from "../store/adminStore";
import { ShieldCheck, Lock, KeyRound, AlertTriangle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { sanitizeText } from "../Utils/sanitize";

interface FormData {
  officerId: string;
  name: string;
  role: string;
  passkey: string;
  confirmPasskey: string;
}

interface ValidationErrors {
  officerId?: string;
  name?: string;
  role?: string;
  passkey?: string;
  confirmPasskey?: string;
}

export default function AdminSignup() {
  const navigate = useNavigate();
  const { registerAdmin, loading, error } = useAdminStore();

  const [formData, setFormData] = useState<FormData>({
    officerId: "",
    name: "",
    role: "",
    passkey: "",
    confirmPasskey: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitized = name === "passkey" || name === "confirmPasskey" ? value : sanitizeText(value);
    setFormData((prev) => ({
      ...prev,
      [name]: sanitized,
    }));
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { officerId, name, role, passkey, confirmPasskey } = formData;

    const errors: ValidationErrors = {};
    if (!officerId.trim()) errors.officerId = "Electoral Officer ID / Email is required.";
    if (!name.trim()) errors.name = "Full name is required.";
    if (!role.trim()) errors.role = "Role is required.";
    if (!passkey || passkey.length < 6) errors.passkey = "Passcode must be at least 6 characters.";
    if (passkey !== confirmPasskey) errors.confirmPasskey = "Passcodes do not match.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the validation errors.");
      return;
    }

    const result = await registerAdmin({
      officerId: officerId.trim().toUpperCase(),
      name: name.trim(),
      role: role.trim(),
      passkey: passkey.trim(),
    });

    if (result.success) {
      toast.success("Administrator account created successfully!");
      navigate("/xadmin/login");
    } else {
      toast.error(result.message || "Registration failed.");
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <div className="admin-badge-icon">
            <ShieldCheck size={28} />
          </div>
          <span className="admin-security-pill">
            <Lock size={12} /> Restricted Electoral Portal
          </span>
          <h1 className="admin-auth-title">Administrator Registration</h1>
          <p className="admin-auth-subtitle">
            Register a new electoral officer account. All registrations are logged in the immutable audit trail.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-auth-form">
          <div className="form-group">
            <label htmlFor="officerId">
              <KeyRound size={15} /> Electoral Officer ID / Email
            </label>
            <input
              type="text"
              id="officerId"
              name="officerId"
              placeholder="e.g. OFFICER-ABIA-01"
              value={formData.officerId}
              onChange={handleChange}
              disabled={loading}
              className={`admin-input ${validationErrors.officerId ? "input-error" : ""}`}
              autoComplete="username"
            />
            {validationErrors.officerId && (
              <span className="admin-field-error">{validationErrors.officerId}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className={`admin-input ${validationErrors.name ? "input-error" : ""}`}
              autoComplete="name"
            />
            {validationErrors.name && (
              <span className="admin-field-error">{validationErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">Role / Position</label>
            <input
              type="text"
              id="role"
              name="role"
              placeholder="e.g. State Electoral Commissioner"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className={`admin-input ${validationErrors.role ? "input-error" : ""}`}
            />
            {validationErrors.role && (
              <span className="admin-field-error">{validationErrors.role}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="passkey">
              <Lock size={15} /> Security Passcode / PIN
            </label>
            <input
              type="password"
              id="passkey"
              name="passkey"
              placeholder="Min. 6 characters"
              value={formData.passkey}
              onChange={handleChange}
              disabled={loading}
              className={`admin-input ${validationErrors.passkey ? "input-error" : ""}`}
              autoComplete="new-password"
            />
            {validationErrors.passkey && (
              <span className="admin-field-error">{validationErrors.passkey}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPasskey">Confirm Passcode</label>
            <input
              type="password"
              id="confirmPasskey"
              name="confirmPasskey"
              placeholder="Re-enter passcode"
              value={formData.confirmPasskey}
              onChange={handleChange}
              disabled={loading}
              className={`admin-input ${validationErrors.confirmPasskey ? "input-error" : ""}`}
              autoComplete="new-password"
            />
            {validationErrors.confirmPasskey && (
              <span className="admin-field-error">{validationErrors.confirmPasskey}</span>
            )}
          </div>

          {error && (
            <div className="admin-error-box">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-admin-submit" disabled={loading}>
            {loading ? (
              <span className="btn-spinner">Creating Account...</span>
            ) : (
              <>
                <ShieldCheck size={16} /> Register Administrator
              </>
            )}
          </button>
        </form>

        <div className="admin-auth-footer">
          <Link to="/xadmin/login" className="btn-back-home">
            <ArrowLeft size={14} /> Back to Admin Login
          </Link>
          <Link to="/" className="btn-voter-portal">
            Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
