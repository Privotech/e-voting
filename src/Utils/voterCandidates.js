// Candidate list and management module
export const candidates = {
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

export const updateCandidateDetails = (position, candidateId, updatedFields, saveFn) => {
  if (!candidates[position]) return false;
  const index = candidates[position].findIndex((c) => c.id === candidateId);
  if (index !== -1) {
    candidates[position][index] = { ...candidates[position][index], ...updatedFields };
    if (saveFn) saveFn();
    return true;
  }
  return false;
};

export const addNewCandidate = (position, newCandidate, votesObj, saveFn) => {
  if (!candidates[position]) candidates[position] = [];
  const candidateId = `${position.slice(0, 3)}-00${candidates[position].length + 1}`;
  const candidateObj = {
    id: candidateId,
    name: newCandidate.name,
    party: newCandidate.party,
    partyShort: newCandidate.partyShort || newCandidate.party.substring(0, 3).toUpperCase(),
    photo: newCandidate.photo || "https://via.placeholder.com/150?text=" + encodeURIComponent(newCandidate.name),
    isVerified: true,
    verificationLabel: "INEC Security Clearance Verified",
  };
  candidates[position].push(candidateObj);
  if (votesObj) votesObj[candidateId] = 2; // default baseline
  if (saveFn) saveFn();
  return candidateObj;
};
