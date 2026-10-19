import { create } from 'zustand';
import { appendAuditLog } from '../Utils/auditLogUtils';
import { recordFailedAttempt, clearAttempts, getLockoutInfo, validateSessionTimestamp, sanitizeSessionData } from '../Utils/authSecurity';
import securityConfig from '../Utils/securityConfig';

interface AdminSession {
  officerId: string;
  name: string;
  role: string;
  authenticatedAt: string;
  token: string;
}

interface RegisteredAdmin {
  officerId: string;
  name: string;
  role: string;
  passkeyHash: string;
  registeredAt: string;
}

interface AdminStore {
  admin: AdminSession | null;
  isAdminAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  registerAdmin: (adminData: { officerId: string; name: string; role: string; passkey: string }) => Promise<{ success: boolean; message?: string; admin?: RegisteredAdmin }>;
  adminLogin: (officerId: string, passkey: string) => Promise<{ success: boolean; message?: string; locked?: boolean; admin?: AdminSession }>;
  adminLogout: () => void;
}

const getInitialAdminSession = (): AdminSession | null => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = sessionStorage.getItem('inec_admin_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      const sanitized = sanitizeSessionData(parsed);
      if (
        !sanitized?.officerId ||
        !sanitized.name ||
        !sanitized.role ||
        !sanitized.authenticatedAt ||
        !sanitized.token ||
        sanitized.token.split(".").length !== 3
      ) {
        return null;
      }
      if (!validateSessionTimestamp(sanitized.authenticatedAt, securityConfig.adminSessionTimeoutMs)) {
        sessionStorage.removeItem('inec_admin_session');
        return null;
      }
      return {
        officerId: sanitized.officerId,
        name: sanitized.name,
        role: sanitized.role,
        authenticatedAt: sanitized.authenticatedAt,
        token: sanitized.token,
      };
    }
  } catch (e) {
    console.warn('Failed to parse saved admin session', e);
    try {
      sessionStorage.removeItem('inec_admin_session');
    } catch {
      return null;
    }
  }
  return null;
};

const initialSession = getInitialAdminSession();

export const useAdminStore = create<AdminStore>((set, get) => ({
  admin: initialSession,
  isAdminAuthenticated: !!initialSession,
  loading: false,
  error: null,

  registerAdmin: async () => {
    const message = "Administrator accounts must be provisioned by an authorized operator.";
    set({ loading: false, error: message });
    return { success: false, message };
  },

  adminLogin: async (officerId, passkey) => {
    set({ loading: true, error: null });

    const lockout = getLockoutInfo();
    if (lockout) {
      const msg = "Too many failed attempts. Please wait before trying again.";
      set({ loading: false, error: msg });
      return { success: false, message: msg, locked: true };
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: officerId.trim(), password: passkey }),
      });
      const data = await response.json();
      if (!response.ok || data.isAdmin !== true || typeof data.token !== "string") {
        throw new Error(response.ok ? "This account is not authorized for administrator access." : data.message || "Invalid administrator credentials.");
      }

      const adminData: AdminSession = {
        officerId: officerId.trim(),
        name: typeof data.name === "string" ? data.name : officerId.trim(),
        role: "System Administrator",
        authenticatedAt: new Date().toISOString(),
        token: data.token,
      };
      sessionStorage.setItem('inec_admin_session', JSON.stringify(adminData));
      set({ admin: adminData, isAdminAuthenticated: true, loading: false, error: null });
      clearAttempts();
      return { success: true, admin: adminData };
    } catch (error) {
      const failureMessage = error instanceof Error
        ? error.message
        : "Unable to authenticate with the administrator service.";
      const result = recordFailedAttempt("admin");
      const errorMsg = result.locked
        ? "Too many failed attempts. Account temporarily locked."
        : failureMessage;
      set({ loading: false, error: errorMsg });

      return { success: false, message: errorMsg, locked: result.locked };
    }
  },

  adminLogout: () => {
    const currentAdmin = get().admin;
    if (currentAdmin) {
      try {
        appendAuditLog({
          category: "System Integrity",
          action: "ADMIN_LOGOUT",
          actor: `${currentAdmin.name} (${currentAdmin.officerId})`,
          details: "Administrative session terminated and logged out safely."
        });
      } catch (err) {
        console.warn("Failed to log admin logout", err);
      }
    }

    sessionStorage.removeItem('inec_admin_session');
    clearAttempts();
    set({ admin: null, isAdminAuthenticated: false, loading: false, error: null });
  }
}));

export default useAdminStore;
