"use client";

import { Link, useLocation } from "../Utils/nextNavigation";
import { ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";
import useAdminStore from "../store/adminStore";

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const { isAdminAuthenticated } = useAdminStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="admin-layout-wrapper">
      <div className="admin-top-bar">
        <Link to="/" className="admin-top-bar-brand">
          <ShieldCheck size={18} />
          <span>Electoral Commission Admin</span>
        </Link>
        <nav className="admin-top-bar-nav">
          <Link to="/xadmin" className={`admin-top-bar-link ${isActive('/xadmin') ? 'active' : ''}`}>
            <KeyRound size={14} /> Register
          </Link>
          {!isAdminAuthenticated && (
            <Link to="/xadmin/login" className={`admin-top-bar-link ${isActive('/xadmin/login') ? 'active' : ''}`}>
              <ArrowLeft size={14} /> Login
            </Link>
          )}
          {isAdminAuthenticated && (
            <Link to="/xadmin/dashboard" className={`admin-top-bar-link ${isActive('/xadmin/dashboard') ? 'active' : ''}`}>
              Dashboard
            </Link>
          )}
          <Link to="/" className="admin-top-bar-back">
            <ArrowLeft size={14} />
            Back to Public Portal
          </Link>
        </nav>
      </div>
      <main className="admin-layout-main">
        {children}
      </main>
    </div>
  );
}
