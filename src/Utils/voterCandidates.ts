// Candidate list and management module
export const POSITIONS = ["president", "governor", "senator", "houseOfReps"] as const;
export type ElectionPosition = (typeof POSITIONS)[number];

export interface LocalCandidate {
  id: string;
  name: string;
  party: string;
  partyShort: string;
  photo: string;
  isVerified: boolean;
  verificationLabel: string;
}

export interface NewCandidate {
  name: string;
  party: string;
  partyShort?: string;
  photo?: string;
}

export const candidates: Record<ElectionPosition, LocalCandidate[]> = {
  president: [
    {
      id: "pres-001",
      name: "John Smith",
      party: "Democratic Party",
      partyShort: "DP",
      photo: "https://via.placeholder.com/150?text=John+Smith&bg=0066cc&text_color=ffffff",
      isVerified: true,
      verificationLabel: "INEC Security Clearance Verified",
    },
    {
      id: "pres-002",
      name: "Sarah Johnson",
      party: "Republican Party",
      partyShort: "RP",
      photo: "https://via.placeholder.com/150?text=Sarah+Johnson&bg=cc0000&text_color=ffffff",
      isVerified: true,
      verificationLabel: "INEC Security Clearance Verified",
    },
    {
      id: "pres-003",
      name: "Michael Brown",
      party: "Independent",
      partyShort: "IND",
      photo: "https://via.placeholder.com/150?text=Michael+Brown&bg=00cc00&text_color=ffffff",
      isVerified: true,
      verificationLabel: "INEC Security Clearance Verified",
    },
  ],
  governor: [
    {
      id: "gov-001",
      name: "Alice Williams",
      party: "Democratic Party",
      partyShort: "DP",
      photo: "https://via.placeholder.com/150?text=Alice+Williams&bg=0066cc&text_color=ffffff",
      isVerified: true,
      verificationLabel: "INEC Security Clearance Verified",
    },
    {
      id: "gov-002",
      name: "Robert Davis",
      party: "Republican Party",
      partyShort: "RP",
      photo: "https://via.placeholder.com/150?text=Robert+Davis&bg=cc0000&text_color=ffffff",
      isVerified: true,
      verificationLabel: "INEC Security Clearance Verified",
    },
    {
      id: "gov-003",
      name: "Jennifer Miller",
      party: "Independent",
      partyShort: "IND",
      photo: "https://via.placeholder.com/150?text=Jennifer+Miller&bg=00cc00&text_color=ffffff",
      isVerified: true,
      verificationLabel: "INEC Security Clearance Verified",
    },
  ],
  senator: [
    {
      id: "sen-001",
      name: "Charles Anderson",
      party: "Democratic Party",
      partyShort: "DP",
      photo: "https://via.placeholder.com/150?text=Charles+Anderson&bg=0066cc&text_color=ffffff",
      isVerified: true,
      verificationLabel: "INEC Security Clearance Verified",
    },
    {
      id: "sen-002",
      name: "Patricia Taylor",
      party: "Republican Party",
      partyShort: "RP",
      photo: "https://via.placeholder.com/150?text=Patricia+Taylor&bg=cc0000&text_color=ffffff",
      isVerified: true,
      verificationLabel: "INEC Security Clearance Verified",
    },
    {
      id: "sen-003",
      name: "Daniel Martinez",
      party: "Independent",
      partyShort: "IND",
      photo: "https://via.placeholder.com/150?text=Daniel+Martinez&bg=00cc00&text_color=ffffff",
      isVerified: true,
      verificationLabel: "INEC Security Clearance Verified",
    },
  ],
  houseOfReps: [
    {
      id: "house-001",
      name: "Emily White",
      party: "Democratic Party",
      partyShort: "DP",
      photo: "https://via.placeholder.com/150?text=Emily+White&bg=0066cc&text_color=ffffff",
      isVerified: true,
      verificationLabel: "INEC Security Clearance Verified",
    },
    {
      id: "house-002",
      name: "James Harris",
      party: "Republican Party",
      partyShort: "RP",
      photo: "https://via.placeholder.com/150?text=James+Harris&bg=cc0000&text_color=ffffff",
      isVerified: true,
      verificationLabel: "INEC Security Clearance Verified",
    },
    {
      id: "house-003",
      name: "Maria Garcia",
      party: "Independent",
      partyShort: "IND",
      photo: "https://via.placeholder.com/150?text=Maria+Garcia&bg=00cc00&text_color=ffffff",
      isVerified: true,
      verificationLabel: "INEC Security Clearance Verified",
    },
  ],
};

export const updateCandidateDetails = (
  position: string,
  candidateId: string,
  updatedFields: Partial<LocalCandidate>,
  saveFn?: () => void,
): boolean => {
  if (!POSITIONS.includes(position as ElectionPosition)) return false;
  const validPosition = position as ElectionPosition;
  const index = candidates[validPosition].findIndex((candidate) => candidate.id === candidateId);
  if (index !== -1) {
    candidates[validPosition][index] = { ...candidates[validPosition][index], ...updatedFields };
    if (saveFn) saveFn();
    return true;
  }
  return false;
};

export const addNewCandidate = (
  position: string,
  newCandidate: NewCandidate,
  votesObj?: Record<string, number>,
  saveFn?: () => void,
): LocalCandidate | null => {
  if (!POSITIONS.includes(position as ElectionPosition)) return null;
  const validPosition = position as ElectionPosition;
  const candidateId = `${validPosition.slice(0, 3)}-00${candidates[validPosition].length + 1}`;
  const candidateObj: LocalCandidate = {
    id: candidateId,
    name: newCandidate.name,
    party: newCandidate.party,
    partyShort: newCandidate.partyShort || newCandidate.party.substring(0, 3).toUpperCase(),
    photo: newCandidate.photo || "https://via.placeholder.com/150?text=" + encodeURIComponent(newCandidate.name),
    isVerified: true,
    verificationLabel: "INEC Security Clearance Verified",
  };
  candidates[validPosition].push(candidateObj);
  if (votesObj) votesObj[candidateId] = 2; // default baseline
  if (saveFn) saveFn();
  return candidateObj;
};
