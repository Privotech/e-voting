"use client";

import { Link, useLocation } from "../Utils/nextNavigation";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  BookOpen, 
  LogOut, 
  Vote, 
  CheckCircle2, 
  Clock,
  Shield,
  Copy
} from "lucide-react";
import useVoterStore from "../store/voterStore";
import { votedVoters, getVoterReceipt } from "../Utils/voterData";
import { useState, useEffect } from "react";

interface VoterDashboardLayoutProps {
  children?: React.ReactNode;
}

export default function VoterDashboardLayout({ children }: VoterDashboardLayoutProps) {
  const router = useRouter();
  const location = useLocation();
  const { voter, logout } = useVoterStore();
  const [receipt, setReceipt] = useState<{ receiptToken?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (voter?.nin) {
      setReceipt(getVoterReceipt(voter.nin));
    }
  }, [voter]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const copyReceiptToken = () => {
    if (receipt?.receiptToken) {
      navigator.clipboard.writeText(receipt.receiptToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasVoted = voter?.nin ? votedVoters.has(voter.nin) : false;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="voter-dashboard-layout">
      <aside className="voter-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <Vote size={24} />
            </div>
            <div className="sidebar-title">
              <h1>Voter Portal</h1>
              <span className="sidebar-subtitle">Election {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>

        <div className="sidebar-user-card">
          <div className="user-avatar">
            <span>{voter?.fullName?.charAt(0) || voter?.name?.charAt(0) || "V"}</span>
          </div>
          <div className="user-info">
            <p className="user-name">{voter?.fullName || voter?.name || "Voter"}</p>
            <p className="user-nin">NIN: {voter?.nin?.substring(0, 4)}****{voter?.nin?.substring(8)}</p>
          </div>
          <div className={`status-badge ${hasVoted ? 'voted' : 'eligible'}`}>
            {hasVoted ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            <span>{hasVoted ? "Voted" : "Eligible"}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/ballot" className={`sidebar-link ${isActive('/ballot') ? 'active' : ''}`}>
            <FileText size={18} />
            <span>Cast Ballot</span>
          </Link>
          <Link to="/results" className={`sidebar-link ${isActive('/results') ? 'active' : ''}`}>
            <BarChart3 size={18} />
            <span>Live Results</span>
          </Link>
          <Link to="/guide" className={`sidebar-link ${isActive('/guide') ? 'active' : ''}`}>
            <BookOpen size={18} />
            <span>Election Guide</span>
          </Link>
        </nav>

        {receipt?.receiptToken && (
          <div className="sidebar-receipt-card">
            <div className="receipt-header">
              <Shield size={14} />
              <span>Receipt Token</span>
            </div>
            <div className="receipt-token" onClick={copyReceiptToken} title="Click to copy">
              <code>{receipt.receiptToken}</code>
              <Copy size={14} className={copied ? 'copied' : ''} />
            </div>
            <p className="receipt-hint">Click token to copy</p>
          </div>
        )}

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="voter-dashboard-main">
        {children}
      </main>
    </div>
  );
}
