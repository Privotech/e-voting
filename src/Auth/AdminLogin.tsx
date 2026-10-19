"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useAdminStore from "../store/adminStore";
import { ShieldCheck, Lock, KeyRound, AlertTriangle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { getLockoutInfo, recordFailedAttempt } from "../Utils/authSecurity";
import securityConfig from "../Utils/securityConfig";

interface ValidationErrors {
  officerId?: string;
  passkey?: string;
}

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminLogin, loading, error } = useAdminStore();

  const [officerId, setOfficerId] = useState("");
  const [passkey, setPasskey] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [localError, setLocalError] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState(securityConfig.maxLoginAttempts);

  const redirectPath = searchParams?.get('from') || "/xadmin/dashboard";

  useEffect(() => {
    const lockout = getLockoutInfo();
    if (lockout) {
      setRemainingAttempts(0);
    } else {
      setRemainingAttempts(securityConfig.maxLoginAttempts);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setValidationErrors({});

    const errors: ValidationErrors = {};
    if (!officerId.trim()) errors.officerId = "Electoral Officer ID / Email is required.";
    if (!passkey.trim()) errors.passkey = "Security Passcode is required.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fill in all required administrative credentials.");
      return;
    }

    const result = await adminLogin(officerId, passkey);

    if (result.success) {
      toast.success(`Welcome, ${result.admin?.name || 'administrator'}!`);
      router.push(redirectPath);
    } else {
      const attemptResult = recordFailedAttempt("admin");
      setRemainingAttempts(Math.max(0, securityConfig.maxLoginAttempts - (attemptResult.locked ? securityConfig.maxLoginAttempts : attemptResult.remainingAttempts + 1)));
      if (!result.locked) {
        toast.error(result.message || "Administrative authentication failed.");
      }
    }
  };

  const lockout = getLockoutInfo();

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
          <h1 className="admin-auth-title">Administrative Portal</h1>
          <p className="admin-auth-subtitle">
            INEC Election Management & Immutable Control Center. Access is strictly restricted to authorized electoral officials.
          </p>
        </div>

        {lockout && (
          <div className="admin-error-box">
            <AlertTriangle size={18} />
            <span>Too many failed attempts. Please wait before trying again.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-auth-form">
          <div className="form-group">
            <label htmlFor="officerId">
              <KeyRound size={15} /> Electoral Officer ID / Email
            </label>
            <input
              type="text"
              id="officerId"
              placeholder="e.g. INEC-ADM-2026"
              value={officerId}
              onChange={(e) => {
                setOfficerId(e.target.value);
                if (validationErrors.officerId) setValidationErrors({ ...validationErrors, officerId: undefined });
              }}
              disabled={loading || !!lockout}
              className={`admin-input ${validationErrors.officerId ? "input-error" : ""}`}
              autoComplete="username"
            />
            {validationErrors.officerId && (
              <span className="admin-field-error">{validationErrors.officerId}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="passkey">
              <Lock size={15} /> Security Passcode / PIN
            </label>
            <input
              type="password"
              id="passkey"
              placeholder="••••••••••••"
              value={passkey}
              onChange={(e) => {
                setPasskey(e.target.value);
                if (validationErrors.passkey) setValidationErrors({ ...validationErrors, passkey: undefined });
              }}
              disabled={loading || !!lockout}
              className={`admin-input ${validationErrors.passkey ? "input-error" : ""}`}
              autoComplete="current-password"
            />
            {validationErrors.passkey && (
              <span className="admin-field-error">{validationErrors.passkey}</span>
            )}
          </div>

          {!lockout && remainingAttempts < securityConfig.maxLoginAttempts && (
            <div className="admin-attempts-warning">
              {remainingAttempts > 0
                ? `${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining before temporary lockout.`
                : "Final attempt before lockout."}
            </div>
          )}

          {(error || localError) && (
            <div className="admin-error-box">
              <AlertTriangle size={18} />
              <span>{error || localError}</span>
            </div>
          )}

          <button type="submit" className="btn-admin-submit" disabled={loading || !!lockout}>
            {loading ? (
              <span className="btn-spinner">Verifying Credentials...</span>
            ) : (
              <>
                <Lock size={16} /> Authenticate Admin Portal
              </>
            )}
          </button>
        </form>

        <div className="admin-security-notice">
          <AlertTriangle size={14} className="notice-icon" />
          <span>
            Security Warning: All access attempts, setting modifications, and candidate edits are cryptographically recorded into the national immutable SHA-256 audit log.
          </span>
        </div>

        <div className="admin-auth-footer">
          <Link href="/" className="btn-back-home">
            <ArrowLeft size={14} /> Back to Public Homepage
          </Link>
          <Link href="/login" className="btn-voter-portal">
            Voter Login Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
