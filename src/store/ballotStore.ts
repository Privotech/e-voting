import { create } from 'zustand';

interface Selections {
  president: string | null;
  governor: string | null;
  senator: string | null;
  houseOfReps: string | null;
}

interface BallotStore {
  selections: Selections;
  validationErrors: Record<string, string | null>;
  isSubmitting: boolean;
  castSuccess: boolean;
  receiptToken: string | null;
  submissionError: string | null;
  hasVotedStatus: boolean;
  selectCandidate: (position: keyof Selections, candidateId: string) => void;
  clearSelection: (position: keyof Selections) => void;
  resetBallot: () => void;
  validateBallot: (requiredPositions?: string[]) => { isValid: boolean; errors: Record<string, string> };
  checkDoubleVoting: (voterNIN: string) => Promise<{ hasVoted: boolean; message: string; receiptToken?: string; votedAt?: string }>;
  submitBallot: (voterNIN: string) => Promise<{ success: boolean; message: string; receiptToken?: string }>;
}

export const useBallotStore = create<BallotStore>((set, get) => ({
  selections: {
    president: null,
    governor: null,
    senator: null,
    houseOfReps: null,
  },
  
  validationErrors: {},
  isSubmitting: false,
  castSuccess: false,
  receiptToken: null,
  submissionError: null,
  hasVotedStatus: false,

  selectCandidate: (position, candidateId) => {
    set((state) => ({
      selections: {
        ...state.selections,
        [position]: candidateId,
      },
      validationErrors: {
        ...state.validationErrors,
        [position]: null,
      },
      submissionError: null,
    }));
  },

  clearSelection: (position) => {
    set((state) => ({
      selections: {
        ...state.selections,
        [position]: null,
      },
    }));
  },

  resetBallot: () => {
    set({
      selections: {
        president: null,
        governor: null,
        senator: null,
        houseOfReps: null,
      },
      validationErrors: {},
      isSubmitting: false,
      castSuccess: false,
      receiptToken: null,
      submissionError: null,
    });
  },

  validateBallot: (requiredPositions = ['president', 'governor', 'senator', 'houseOfReps']) => {
    const { selections } = get();
    const errors: Record<string, string> = {};
    let isValid = true;

    requiredPositions.forEach((position) => {
      if (!selections[position as keyof Selections]) {
        errors[position] = `Please select a candidate for ${position}.`;
        isValid = false;
      }
    });

    set({ validationErrors: errors });
    return { isValid, errors };
  },

  checkDoubleVoting: async (voterNIN) => {
    if (!voterNIN) {
      return { hasVoted: false, message: 'NIN is missing' };
    }

    const token = sessionStorage.getItem('voterAuthToken');
    if (!token) {
      return { hasVoted: true, message: 'Your voting session has expired. Please log in again.' };
    }

    try {
      const response = await fetch(`/api/voters/status/${encodeURIComponent(voterNIN)}`, {
        headers: { 'x-auth-token': token },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.hasVoted) {
          set({ hasVotedStatus: true });
          return {
            hasVoted: true,
            receiptToken: data.receiptToken,
            votedAt: data.votedAt,
            message: 'You have already cast a ballot. Duplicate voting is strictly prohibited.',
          };
        }
      } else if (response.status === 401 || response.status === 403) {
        return { hasVoted: true, message: 'Your voting session has expired. Please log in again.' };
      }
    } catch {
      return { hasVoted: false, message: 'Unable to verify your voting status. Please try again.' };
    }

    set({ hasVotedStatus: false });
    return { hasVoted: false, message: 'Voter is eligible to cast ballot.' };
  },

  submitBallot: async (voterNIN) => {
    const { selections, isSubmitting, validateBallot, checkDoubleVoting } = get();

    if (isSubmitting) {
      return { success: false, message: 'Submission already in progress...' };
    }

    const { isValid, errors } = validateBallot();
    if (!isValid) {
      const firstError = Object.values(errors).find((e) => e);
      set({ submissionError: firstError || 'Please complete all ballot positions before submitting.' });
      return { success: false, message: firstError || 'Incomplete ballot selections.' };
    }

    const doubleVoteCheck = await checkDoubleVoting(voterNIN);
    if (doubleVoteCheck.hasVoted) {
      set({ submissionError: doubleVoteCheck.message, isSubmitting: false });
      return { success: false, message: doubleVoteCheck.message };
    }

    set({ isSubmitting: true, submissionError: null });

    const token = sessionStorage.getItem('voterAuthToken');
    if (!token) {
      const message = 'Your voting session has expired. Please log in again.';
      set({ submissionError: message });
      return { success: false, message };
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ voterNIN, selections }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        set({
          isSubmitting: false,
          castSuccess: true,
          receiptToken: data.receiptToken,
          hasVotedStatus: true,
        });
        return {
          success: true,
          receiptToken: data.receiptToken,
          message: data.message || 'Vote cast successfully!',
        };
      }
      const message = typeof data.message === 'string' ? data.message : 'Failed to submit vote.';
      set({ isSubmitting: false, submissionError: message });
      return { success: false, message };
    } catch {
      const message = 'Unable to submit your ballot. No vote was recorded; please try again.';
      set({ isSubmitting: false, submissionError: message });
      return { success: false, message };
    }
  },
}));

export default useBallotStore;
