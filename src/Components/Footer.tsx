"use client";

import React from 'react';
import { useTheme } from '../Context/ThemeContext';
import { Palette } from 'lucide-react';

const Footer = () => {
  const { activeTemplate, toggleSelector } = useTheme();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-brand-col">
          <div className="footer-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M7 10v12h10V10" />
              <path d="M5 10h14l1-5H4l1 5z" />
            </svg>
            <span>e.Voting Portal</span>
          </div>
          <p className="footer-tagline">
            Official National Electoral Portal powered by end-to-end verifiable ballot encryption.
          </p>
        </div>

        <div className="footer-meta-col">
          <button className="footer-theme-btn" onClick={toggleSelector}>
            <Palette size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
            Current Theme: <strong>{activeTemplate.name}</strong>
          </button>

          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <span>•</span>
            <a href="#terms">Terms of Service</a>
            <span>•</span>
            <a href="#audit">Electoral Audit</a>
          </div>

          <p className="footer-copy">&copy; {new Date().getFullYear()} e.Voting Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
