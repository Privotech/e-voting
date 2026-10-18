"use client";

import { useState } from "react";
import { BookOpen, FileText, ShieldCheck, HelpCircle, Lock } from "lucide-react";
import GuideProcedureTab from "./ElectionGuide/GuideProcedureTab";
import GuideRulesTab from "./ElectionGuide/GuideRulesTab";
import GuideFaqTab from "./ElectionGuide/GuideFaqTab";
import GuideVerificationSandbox from "./ElectionGuide/GuideVerificationSandbox";

type TabId = "procedure" | "rules" | "faq" | "sandbox";

export default function ElectionGuide() {
  const [activeTab, setActiveTab] = useState<TabId>("procedure");

  return (
    <div className="guide-page-wrapper">
      <div className="guide-container">
        {/* Banner Header */}
        <div className="guide-hero-banner">
          <div className="hero-icon-pill">
            <BookOpen size={24} />
          </div>
          <div className="hero-text">
            <h1>2026 Election Guide & Verification Standard</h1>
            <p>Official guidelines, security architecture, voting procedures, and verifier tool.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="guide-nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === "procedure" ? "active" : ""}`}
            onClick={() => setActiveTab("procedure")}
          >
            <FileText size={16} /> 5-Step Process
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "rules" ? "active" : ""}`}
            onClick={() => setActiveTab("rules")}
          >
            <ShieldCheck size={16} /> Electoral Rules
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "faq" ? "active" : ""}`}
            onClick={() => setActiveTab("faq")}
          >
            <HelpCircle size={16} /> FAQ & Support
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "sandbox" ? "active" : ""}`}
            onClick={() => setActiveTab("sandbox")}
          >
            <Lock size={16} /> Receipt Hash Verifier
          </button>
        </div>

        {/* Tab Body */}
        <div className="guide-main-body">
          {activeTab === "procedure" && <GuideProcedureTab />}
          {activeTab === "rules" && <GuideRulesTab />}
          {activeTab === "faq" && <GuideFaqTab />}
          {activeTab === "sandbox" && <GuideVerificationSandbox />}
        </div>
      </div>
    </div>
  );
}
