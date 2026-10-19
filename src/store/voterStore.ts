import { create } from 'zustand';
import { sanitizeSessionData } from '../Utils/authSecurity';

interface VoterSession {
  nin: string;
  dob: string;
  state: string;
  fullName?: string;
  token: string;
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
    const token = sessionStorage.getItem('voterAuthToken');
    if (!nin || !dob || !state || !token) return null;

    const data = { nin, dob, state };
    const sanitized = sanitizeSessionData(data);
    if (!sanitized?.nin || !sanitized.dob || !sanitized.state) return null;
    return {
      nin: sanitized.nin,
      dob: sanitized.dob,
      state: sanitized.state,
      fullName: sanitized.fullName,
      token,
    };
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
      if (response.ok && data.success && typeof data.token === 'string') {
        const voterData = {
          nin: sanitizedNin,
          dob: sanitizedDob,
          state: sanitizedState,
          fullName: data.voter?.fullName,
          token: data.token,
        };
        set({ voter: voterData, loading: false });
        sessionStorage.setItem('voterNIN', sanitizedNin);
        sessionStorage.setItem('voterDOB', sanitizedDob);
        sessionStorage.setItem('voterState', sanitizedState);
        sessionStorage.setItem('voterAuthToken', data.token);
        return data;
      } else {
        const message = typeof data.message === 'string' ? data.message : 'Voter authentication failed.';
        set({ error: message, loading: false });
        return { success: false, message };
      }
    } catch {
      const message = 'Unable to reach the voter registry. Please try again.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  logout: () => {
    set({ voter: null, loading: false, error: null });
    sessionStorage.removeItem('voterNIN');
    sessionStorage.removeItem('voterDOB');
    sessionStorage.removeItem('voterState');
    sessionStorage.removeItem('voterAuthToken');
  },

  refreshSession: () => {
    const session = getInitialVoterSession();
    set({ voter: session });
    if (!session) {
      sessionStorage.removeItem('voterNIN');
      sessionStorage.removeItem('voterDOB');
      sessionStorage.removeItem('voterState');
      sessionStorage.removeItem('voterAuthToken');
    }
  }
}));

export default useVoterStore;
