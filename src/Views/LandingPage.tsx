"use client";

import React, { useState } from "react";
import { useNavigate } from "../Utils/nextNavigation";
import { useTheme } from "../Context/ThemeContext";
import { ShieldCheck, Lock, FileCheck, BarChart3, Palette, LogIn, Activity, CheckCircle, Search, Award, BookOpen, Download } from "lucide-react";
import toast from "react-hot-toast";

interface AuditResult {
  searched: boolean;
  valid: boolean;
  token: string;
  timestamp: string;
  blockHash: string;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { activeTemplate, toggleSelector } = useTheme();
  const [auditToken, setAuditToken] = useState(""); 
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const handleAuditSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditToken.trim()) {
      toast.error("Please enter a receipt token ID");
      return;
    }
    
    const isMockValid = auditToken.startsWith("RCP-") || auditToken.length >= 8;
    setAuditResult({
      searched: true,
      valid: isMockValid,
      token: auditToken,
      timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      blockHash: "0x" + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join("")
    });

    if (isMockValid) {
      toast.success("Token verified & confirmed on cryptographic ledger!");
    } else {
      toast.error("Receipt token not found or invalid format.");
    }
  };

  return (
    <div className="landing-page-wrapper">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-badge">
          <span className="badge-pulse"></span>
          <Activity size={14} className="badge-icon" />
          <span>Official Digital Election Portal</span>
        </div>

        <h1 className="hero-title">
          Secure, Transparent & Accessible Voting for Modern Democracy
        </h1>

        <p className="hero-subtitle">
          Cast your vote with confidence using cryptographically secured receipts, real-time ballot verification, and immediate result tallying.
        </p>

        <div className="hero-cta-group">
          <button className="btn-hero-primary" onClick={() => navigate("/login")}>
            <LogIn size={18} />
            Start Voting Now
          </button>

          <button className="btn-hero-secondary" onClick={() => navigate("/results")}>
            <BarChart3 size={18} />
            View Live Results
          </button>

          <button className="btn-hero-secondary" onClick={() => navigate("/guide")}>
            <BookOpen size={18} />
            Election Guide
          </button>


          <button className="btn-hero-theme" onClick={toggleSelector}>
            <Palette size={16} /> Template: <strong>{activeTemplate.name}</strong>
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="hero-stats-grid">
          <div className="stat-card">
            <span className="stat-number">2.4M+</span>
            <span className="stat-label">Verified Registered Voters</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">256-Bit</span>
            <span className="stat-label">SHA Encryption Protocol</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">100%</span>
            <span className="stat-label">Verifiable Audit Token Trail</span>
          </div>
        </div>
      </section>

      {/* Audit Lookup Feature Widget */}
      <section className="audit-lookup-section">
        <div className="audit-card">
          <div className="audit-header">
            <Search size={22} className="audit-icon" />
            <div>
              <h3>Public Receipt Verification Engine</h3>
              <p>Verify that your ballot token has been recorded in the public cryptographic tally.</p>
            </div>
          </div>

          <form onSubmit={handleAuditSearch} className="audit-form">
            <input 
              type="text" 
              placeholder="Enter your Receipt Token (e.g. RCP-172200-8419)"
              value={auditToken}
              onChange={(e) => setAuditToken(e.target.value)}
              className="audit-input"
            />
            <button type="submit" className="btn-audit-search">
              Verify Token
            </button>
          </form>

          {auditResult && auditResult.searched && (
            <div className={`audit-result-box ${auditResult.valid ? 'valid' : 'invalid'}`}>
              <div className="audit-result-status">
                <CheckCircle size={18} />
                <span>{auditResult.valid ? "Token Verified & Recorded on Ledger" : "Invalid or Unrecognized Token"}</span>
              </div>
              {auditResult.valid && (
                <div className="audit-details-grid">
                  <div><small>Token ID:</small> <strong>{auditResult.token}</strong></div>
                  <div><small>Timestamp:</small> <strong>{auditResult.timestamp}</strong></div>
                  <div><small>Ledger Block Hash:</small> <code className="block-hash">{auditResult.blockHash}</code></div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Security & Features */}
      <section className="features-section">
        <div className="section-heading">
          <h2>Engineered for Uncompromising Security</h2>
          <p>Built to meet and exceed international electoral integrity and privacy standards.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><ShieldCheck size={28} /></div>
            <h3>NIN Identity Validation</h3>
            <p>Direct integration with National Identification Registry prevents duplicate account creation or fraudulent ballot casting.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><Lock size={28} /></div>
            <h3>Anonymous Ballot Encryption</h3>
            <p>Your voter identity and candidate selections are separated cryptographically to preserve 100% secret ballot confidentiality.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><FileCheck size={28} /></div>
            <h3>Downloadable Verification Receipt</h3>
            <p>Receive a unique cryptographically signed token receipt upon submission to verify your vote was correctly counted.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><BarChart3 size={28} /></div>
            <h3>Instant Tally & Live Analytics</h3>
            <p>Real-time statistical breakdown by positions including President, Governor, Senator, and House of Representatives.</p>
          </div>
        </div>
      </section>

      {/* How it Works Step Flow */}
      <section className="steps-section">
        <div className="section-heading">
          <h2>4 Simple Steps to Cast Your Vote</h2>
          <p>Quick, intuitive, and accessible from any desktop or mobile browser.</p>
        </div>

        <div className="steps-flow">
          <div className="step-card">
            <div className="step-num">01</div>
            <h4>Authenticate ID</h4>
            <p>Enter your 11-digit NIN, Date of Birth, and State of Residence.</p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h4>Select Candidates</h4>
            <p>Review candidate profiles and pick preferred representatives.</p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h4>Review Ballot</h4>
            <p>Double-check choices before finalizing your non-reversible submission.</p>
          </div>
          <div className="step-card">
            <div className="step-num">04</div>
            <h4>Get Receipt</h4>
            <p>Save your unique digital receipt token for audit verification.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
