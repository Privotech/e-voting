import { create } from 'zustand';
import { validateVoter } from '../Utils/voterData';
import { validateSessionTimestamp, sanitizeSessionData } from '../Utils/authSecurity';
import securityConfig from '../Utils/securityConfig';

interface VoterSession {
  nin: string;
  dob: string;
  state: string;
  fullName?: string;
}

interface VoterStore {
  voter: VoterSession | null;
  error: string | null;
  loading: boolean;
  login: (nin: string, dob: string, state: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshSession: () => void;
}

const getInitialVoterSession = (): VoterSession | null => {
  try {
    const nin = sessionStorage.getItem('voterNIN');
    const dob = sessionStorage.getItem('voterDOB');
    const state = sessionStorage.getItem('voterState');
    if (!nin || !dob || !state) return null;

    const data = { nin, dob, state };
    const sanitized = sanitizeSessionData(data);
    if (!sanitized || !sanitized.nin) return null;
    return sanitized as VoterSession;
  } catch {
    return null;
  }
};

const initialSession = getInitialVoterSession();

export const useVoterStore = create<VoterStore>((set) => ({
  voter: initialSession,
  error: null,
  loading: false,

  login: async (nin, dob, state) => {
    set({ loading: true, error: null });

    const sanitizedNin = nin.replace(/[^0-9]/g, "");
    const sanitizedDob = dob.trim();
    const sanitizedState = state.trim();

    if (sanitizedNin.length !== 11) {
      set({ loading: false, error: "NIN must be exactly 11 numeric digits." });
      return { success: false, message: "NIN must be exactly 11 numeric digits." };
    }

    try {
      const response = await fetch('/api/voters/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nin: sanitizedNin, dob: sanitizedDob, state: sanitizedState }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const voterData = { nin: sanitizedNin, dob: sanitizedDob, state: sanitizedState, ...data.voter };
        set({ voter: voterData, loading: false });
        sessionStorage.setItem('voterNIN', sanitizedNin);
        sessionStorage.setItem('voterDOB', sanitizedDob);
        sessionStorage.setItem('voterState', sanitizedState);
        return data;
      } else if (data.message) {
        set({ error: data.message, loading: false });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.warn('API validation failed, attempting local voterStore check');
    }

    const localResult = validateVoter(sanitizedNin, sanitizedDob, sanitizedState);
    if (localResult.success) {
      set({ voter: { nin: sanitizedNin, dob: sanitizedDob, state: sanitizedState }, loading: false });
      sessionStorage.setItem('voterNIN', sanitizedNin);
      sessionStorage.setItem('voterDOB', sanitizedDob);
      sessionStorage.setItem('voterState', sanitizedState);
    } else {
      set({ error: localResult.message, loading: false });
    }
    return localResult;
  },

  logout: () => {
    set({ voter: null, loading: false, error: null });
    sessionStorage.removeItem('voterNIN');
    sessionStorage.removeItem('voterDOB');
    sessionStorage.removeItem('voterState');
  },

  refreshSession: () => {
    const session = getInitialVoterSession();
    set({ voter: session });
    if (!session) {
      sessionStorage.removeItem('voterNIN');
      sessionStorage.removeItem('voterDOB');
      sessionStorage.removeItem('voterState');
    }
  }
}));

export default useVoterStore;
