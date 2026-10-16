"use client";

import { Link, useLocation, useNavigate } from "../Utils/nextNavigation";
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
import useVoterStore from '../store/voterStore';
import TemplateSelector from './TemplateSelector';
import { Download } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { voter, logout } = useVoterStore();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate.push('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10v12h10V10" />
                <path d="M5 10h14l1-5H4l1 5z" />
                <path d="M10 14h4" />
              </svg>
            </div>
            <span className="brand-text">e.Voting</span>
            <span className="brand-badge">Official</span>
          </Link>
        </div>

        <nav className="navbar-nav">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/guide" className={`nav-item ${isActive('/guide') ? 'active' : ''}`}>
            Election Guide
          </Link>
          <Link to="/results" className={`nav-item ${isActive('/results') ? 'active' : ''}`}>
            Live Results
          </Link>

          {voter && (
            <>
              <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/ballot" className={`nav-item ${isActive('/ballot') ? 'active' : ''}`}>
                Cast Ballot
              </Link>
            </>
          )}
        </nav>

        <div className="navbar-right">
          {/* <a
            href="/api/export/nextjs"
            download="e-voting-nextjs-app.zip"
            className="btn-download-app"
            title="Download Executable Next.js Folder (.zip)"
          >
            <Download size={15} />
            <span>Download Next.js App</span>
          </a> */}

          <TemplateSelector />

          {voter ? (
            <div className="voter-profile-menu">
              <div className="voter-chip">
                <span className="voter-dot"></span>
                <span className="voter-name">{voter.fullName || voter.name || `NIN: ${voter.nin}`}</span>
              </div>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-nav-login">
                Voter Login
              </Link>
              <Link to="/signup" className="btn-nav-signup">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
