import { create } from 'zustand';
import { appendAuditLog } from '../Utils/auditLogUtils';
import { hashPassword, verifyPassword, recordFailedAttempt, clearAttempts, getLockoutInfo, validateSessionTimestamp, sanitizeSessionData } from '../Utils/authSecurity';
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
  try {
    const saved = sessionStorage.getItem('inec_admin_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      const sanitized = sanitizeSessionData(parsed);
      if (!sanitized || !sanitized.officerId || !sanitized.name) {
        return null;
      }
      if (!validateSessionTimestamp(sanitized.authenticatedAt, securityConfig.adminSessionTimeoutMs)) {
        sessionStorage.removeItem('inec_admin_session');
        return null;
      }
      return sanitized as AdminSession;
    }
  } catch (e) {
    console.warn('Failed to parse saved admin session', e);
    sessionStorage.removeItem('inec_admin_session');
  }
  return null;
};

const getRegisteredAdmins = (): RegisteredAdmin[] => {
  try {
    const saved = localStorage.getItem('inec_registered_admins');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to parse registered admins', e);
  }
  return [];
};

const initialSession = getInitialAdminSession();

export const useAdminStore = create<AdminStore>((set, get) => ({
  admin: initialSession,
  isAdminAuthenticated: !!initialSession,
  loading: false,
  error: null,

  registerAdmin: async (adminData) => {
    set({ loading: true, error: null });

    await new Promise((resolve) => setTimeout(resolve, 400));

    const registered = getRegisteredAdmins();

    const exists = registered.find(
      (a) => a.officerId.trim().toUpperCase() === adminData.officerId
    );

    if (exists) {
      set({ loading: false, error: "An administrator with this Officer ID already exists." });
      return { success: false, message: "An administrator with this Officer ID already exists." };
    }

    const hashedPasskey = await hashPassword(adminData.passkey);

    const newAdmin: RegisteredAdmin = {
      officerId: adminData.officerId,
      name: adminData.name,
      role: adminData.role,
      passkeyHash: hashedPasskey,
      registeredAt: new Date().toLocaleTimeString() + " WAT",
    };

    registered.push(newAdmin);

    try {
      localStorage.setItem('inec_registered_admins', JSON.stringify(registered));
    } catch (e) {
      console.warn('Could not store registered admin', e);
      set({ loading: false, error: "Failed to save registration. Storage may be disabled." });
      return { success: false, message: "Failed to save registration." };
    }

    try {
      appendAuditLog({
        category: "System Integrity",
        action: "ADMIN_REGISTRATION",
        actor: `${newAdmin.name} (${newAdmin.officerId})`,
        details: `New administrator registered with role: ${newAdmin.role}.`
      });
    } catch (err) {
      console.warn("Failed to append audit log for admin registration", err);
    }

    set({ loading: false, error: null });
    return { success: true, admin: newAdmin };
  },

  adminLogin: async (officerId, passkey) => {
    set({ loading: true, error: null });

    const lockout = getLockoutInfo();
    if (lockout) {
      const msg = "Too many failed attempts. Please wait before trying again.";
      set({ loading: false, error: msg });
      return { success: false, message: msg, locked: true };
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanId = officerId.trim().toUpperCase();
    const cleanKey = passkey.trim();

    let matched: { id: string; name: string; role: string } | null = null;

    if (securityConfig.isDemo) {
      const validCredentials = [
        { id: 'INEC-ADM-2026', key: 'inec2026admin', name: 'Dr. Mahmood Yakubu', role: 'Chief Electoral Officer' },
        { id: 'ADMIN@INEC.GOV.NG', key: 'admin123', name: 'National Electoral Administrator', role: 'System Admin' },
        { id: 'OFFICER-LAGOS-01', key: 'lagos2026', name: 'Lagos Resident Electoral Commissioner', role: 'State Electoral Commissioner' },
      ];

      matched = validCredentials.find(c => c.id === cleanId && c.key === cleanKey) || null;
    }

    if (!matched && securityConfig.isDemo) {
      const registered = getRegisteredAdmins();
      const regMatch = registered.find(c => c.officerId === cleanId);
      if (regMatch && await verifyPassword(passkey, regMatch.passkeyHash)) {
        matched = { id: regMatch.officerId, name: regMatch.name, role: regMatch.role };
      }
    }

    if (matched) {
      const adminData: AdminSession = {
        officerId: matched.id,
        name: matched.name,
        role: matched.role,
        authenticatedAt: new Date().toLocaleTimeString() + " WAT",
        token: `INEC-JWT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      };

      try {
        sessionStorage.setItem('inec_admin_session', JSON.stringify(adminData));
      } catch (e) {
        console.warn('Could not store admin session', e);
      }

      set({ admin: adminData, isAdminAuthenticated: true, loading: false, error: null });
      clearAttempts();

      try {
        appendAuditLog({
          category: "System Integrity",
          action: "ADMIN_LOGIN_SUCCESS",
          actor: `${adminData.name} (${adminData.officerId})`,
          details: `Authenticated as ${adminData.role} into National Election Management Dashboard.`
        });
      } catch (err) {
        console.warn("Failed to append audit log for admin login", err);
      }

      return { success: true, admin: adminData };
    } else {
      const result = recordFailedAttempt("admin");
      const errorMsg = result.locked
        ? "Too many failed attempts. Account temporarily locked."
        : "Invalid Electoral Officer ID or Security Passcode. Access Denied.";
      set({ loading: false, error: errorMsg });

      try {
        appendAuditLog({
          category: "System Integrity",
          action: "UNAUTHORIZED_ADMIN_ATTEMPT",
          actor: cleanId || "Unknown Entity",
          details: `Failed administrative authentication attempt for Officer ID "${cleanId}".`
        });
      } catch (err) {
        console.warn("Failed to log unauthorized attempt", err);
      }

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
