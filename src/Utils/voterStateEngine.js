import { candidates, updateCandidateDetails as updateCand, addNewCandidate as addCand } from "./voterCandidates.js";

function getStoredValue(key, fallback) {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function persistToLocalStorage(key, value) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable
    }
  }
}

const storedRegisteredVoters = getStoredValue("registeredVoters", ["12345678901", "98765432101", "11111111111", "22222222222", "33333333333"]);
const storedVotedVoters = getStoredValue("votedVoters", []);
const storedVoterReceipts = getStoredValue("voterReceipts", {});
const storedVoterInfo = getStoredValue("voterInfo", {});
const storedVotes = getStoredValue("votes", {});

export const registeredVoters = new Set(
  Array.isArray(storedRegisteredVoters)
    ? storedRegisteredVoters
    : ["12345678901", "98765432101", "11111111111", "22222222222", "33333333333"]
);

export const votedVoters = new Set(Array.isArray(storedVotedVoters) ? storedVotedVoters : []);
export const voterReceipts = typeof storedVoterReceipts === 'object' && storedVoterReceipts !== null ? { ...storedVoterReceipts } : {};
export const voterInfo = typeof storedVoterInfo === 'object' && storedVoterInfo !== null ? { ...storedVoterInfo } : {};
export const votes = typeof storedVotes === 'object' && storedVotes !== null ? { ...storedVotes } : {};

export const saveToLocalStorage = () => {
  saveToLocalStorage("registeredVoters", [...registeredVoters]);
  saveToLocalStorage("votedVoters", [...votedVoters]);
  saveToLocalStorage("voterReceipts", voterReceipts);
  saveToLocalStorage("voterInfo", voterInfo);
  saveToLocalStorage("votes", votes);
};

const initializeVotes = () => {
  const allPositions = ["president", "governor", "senator", "houseOfReps"];
  allPositions.forEach((position) => {
    if (candidates[position]) {
      candidates[position].forEach((candidate) => {
        votes[candidate.id] = storedVotes[candidate.id] !== undefined ? storedVotes[candidate.id] : 2;
      });
    }
  });
};

initializeVotes();

export const validateVoter = (nin, dob, state) => {
  if (!registeredVoters.has(nin)) {
    return {
      success: false,
      message: "NIN not found in voter registry. You are not registered to vote.",
    };
  }

  if (votedVoters.has(nin)) {
    return {
      success: false,
      message: "You have already voted. Duplicate voting is not allowed.",
    };
  }

  if (!dob || !state) {
    return {
      success: false,
      message: "Please provide both date of birth and state.",
    };
  }

  return {
    success: true,
    message: "Voter authenticated successfully",
  };
};

export const registerVoterAsVoted = (nin) => {
  votedVoters.add(nin);
  saveToLocalStorage();
};

const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const registerVoter = (nin, dob, state, fullName) => {
  if (!/^\d{11}$/.test(nin)) {
    return { success: false, message: "NIN must be exactly 11 digits." };
  }
  if (registeredVoters.has(nin)) {
    return { success: false, message: "This NIN is already registered. Please login instead." };
  }
  if (!dob || !state || !fullName) {
    return { success: false, message: "Please provide all required fields." };
  }
  if (calculateAge(dob) < 18) {
    return { success: false, message: "You must be at least 18 years old to register." };
  }

  registeredVoters.add(nin);
  voterInfo[nin] = { fullName, dob, state };
  saveToLocalStorage();

  return { success: true, message: "Registration successful! You can now login to vote." };
};

export const getVoterReceipt = (nin) => voterReceipts[nin] || null;
export const getVoterInfo = (nin) => voterInfo[nin] || null;

export const resetVotesToBaseline = (baseline = 2) => {
  const allPositions = ["president", "governor", "senator", "houseOfReps"];
  allPositions.forEach((position) => {
    if (candidates[position]) {
      candidates[position].forEach((candidate) => {
        votes[candidate.id] = baseline;
      });
    }
  });
  votedVoters.clear();
  Object.keys(voterReceipts).forEach((key) => delete voterReceipts[key]);
  saveToLocalStorage();
};

const generateReceiptToken = () => `RCP-${new Date().getTime()}-${Math.floor(Math.random() * 10000)}`;

export const castVote = (voterNIN, selections) => {
  if (votedVoters.has(voterNIN)) {
    return {
      success: false,
      message: "You have already voted. Duplicate voting is not allowed.",
      receiptToken: null,
    };
  }

  try {
    Object.keys(selections).forEach((position) => {
      const candidateId = selections[position];
      if (candidateId && votes[candidateId] !== undefined) {
        votes[candidateId]++;
      }
    });

    votedVoters.add(voterNIN);
    const receiptToken = generateReceiptToken();
    const timestamp = new Date().toISOString();

    voterReceipts[voterNIN] = { receiptToken, timestamp, selections };
    saveToLocalStorage();

    return {
      success: true,
      message: "Vote cast successfully!",
      receiptToken,
    };
  } catch {
    return {
      success: false,
      message: "An error occurred while casting your vote. Please try again.",
      receiptToken: null,
    };
  }
};

export const getVoteCount = (candidateId) => votes[candidateId] || 0;
export const getAllVotes = () => ({ ...votes });

export const getPositionResults = (position) => {
  if (!candidates[position]) return [];
  return candidates[position]
    .map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      partyShort: candidate.partyShort,
      photo: candidate.photo,
      votes: votes[candidate.id] || 0,
    }))
    .sort((a, b) => b.votes - a.votes);
};

let resultsVisible = false;
export const toggleResultsVisibility = () => {
  resultsVisible = !resultsVisible;
  return resultsVisible;
};
export const areResultsVisible = () => resultsVisible;
export const setResultsVisible = (isVisible) => {
  resultsVisible = isVisible;
};

export const getTurnoutStats = () => {
  const totalVoted = votedVoters.size;
  const totalRegistered = registeredVoters.size;
  const turnoutPercentage = totalRegistered > 0 ? ((totalVoted / totalRegistered) * 100).toFixed(2) : 0;
  return { totalVoted, totalRegistered, turnoutPercentage };
};

export const getComprehensiveResults = () => {
  const positions = ["president", "governor", "senator", "houseOfReps"];
  const results = {};
  positions.forEach((pos) => {
    results[pos] = getPositionResults(pos);
  });
  return {
    results,
    turnout: getTurnoutStats(),
    isVisible: resultsVisible,
    totalVotesCount: votedVoters.size,
  };
};

export const updateCandidateDetails = (position, candidateId, updatedFields) =>
  updateCand(position, candidateId, updatedFields, saveToLocalStorage);

export const addNewCandidate = (position, newCandidate) =>
  addCand(position, newCandidate, votes, saveToLocalStorage);
