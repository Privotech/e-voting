"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAdminStore from '../store/adminStore';
import { getLockoutInfo, validateSessionTimestamp } from '../Utils/authSecurity';
import securityConfig from '../Utils/securityConfig';

export default function AdminProtectedRoute({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdminAuthenticated, admin } = useAdminStore();

  useEffect(() => {
    if (!isAdminAuthenticated || !admin) return;
    if (!validateSessionTimestamp(admin.authenticatedAt, securityConfig.adminSessionTimeoutMs)) {
      useAdminStore.getState().adminLogout();
    }
  }, [isAdminAuthenticated, admin]);

  const lockout = getLockoutInfo();

  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.replace(`/xadmin/login?from=${encodeURIComponent(pathname || '/')}`);
    }
  }, [isAdminAuthenticated, pathname, router]);

  if (!isAdminAuthenticated) {
    return null;
  }

  if (lockout) {
    return (
      <div className="admin-auth-container">
        <div className="admin-auth-card">
          <div className="admin-auth-header">
            <div className="admin-badge-icon">
              <span style={{ fontSize: "2rem" }}>⏳</span>
            </div>
            <h1 className="admin-auth-title">Temporarily Locked</h1>
            <p className="admin-auth-subtitle">
              Too many failed login attempts. Please wait a few minutes before trying again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
