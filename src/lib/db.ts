import "server-only";
import { randomBytes } from "node:crypto";
import type { Candidate as PrismaCandidate, Voter as PrismaVoter } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const POSITIONS = ["president", "governor", "senator", "houseOfReps"] as const;
export type Position = (typeof POSITIONS)[number];

export interface Candidate {
  id: string;
  name: string;
  party: string;
  partyShort: string;
  photo: string;
  position: Position;
  voteCount: number;
}

export interface Voter {
  id: string;
  nin: string;
  name: string;
  dob: string;
  email: string | null;
  state: string;
  isAdmin: boolean;
  hasVoted: boolean;
  votedAt: Date | null;
  receiptToken: string | null;
}

export interface VoterCredentials extends Voter {
  password: string;
}

const defaultCandidates: Candidate[] = [
  { id: "pres-001", name: "John Smith", party: "Democratic Party", partyShort: "DP", photo: "https://via.placeholder.com/150?text=John+Smith&bg=0066cc&text_color=ffffff", position: "president", voteCount: 0 },
  { id: "pres-002", name: "Sarah Johnson", party: "Republican Party", partyShort: "RP", photo: "https://via.placeholder.com/150?text=Sarah+Johnson&bg=cc0000&text_color=ffffff", position: "president", voteCount: 0 },
  { id: "pres-003", name: "Michael Brown", party: "Independent", partyShort: "IND", photo: "https://via.placeholder.com/150?text=Michael+Brown&bg=00cc00&text_color=ffffff", position: "president", voteCount: 0 },
  { id: "gov-001", name: "Alice Williams", party: "Democratic Party", partyShort: "DP", photo: "https://via.placeholder.com/150?text=Alice+Williams&bg=0066cc&text_color=ffffff", position: "governor", voteCount: 0 },
  { id: "gov-002", name: "Robert Davis", party: "Republican Party", partyShort: "RP", photo: "https://via.placeholder.com/150?text=Robert+Davis&bg=cc0000&text_color=ffffff", position: "governor", voteCount: 0 },
  { id: "gov-003", name: "Jennifer Miller", party: "Independent", partyShort: "IND", photo: "https://via.placeholder.com/150?text=Jennifer+Miller&bg=00cc00&text_color=ffffff", position: "governor", voteCount: 0 },
  { id: "sen-001", name: "Charles Anderson", party: "Democratic Party", partyShort: "DP", photo: "https://via.placeholder.com/150?text=Charles+Anderson&bg=0066cc&text_color=ffffff", position: "senator", voteCount: 0 },
  { id: "sen-002", name: "Patricia Taylor", party: "Republican Party", partyShort: "RP", photo: "https://via.placeholder.com/150?text=Patricia+Taylor&bg=cc0000&text_color=ffffff", position: "senator", voteCount: 0 },
  { id: "sen-003", name: "Daniel Martinez", party: "Independent", partyShort: "IND", photo: "https://via.placeholder.com/150?text=Daniel+Martinez&bg=00cc00&text_color=ffffff", position: "senator", voteCount: 0 },
  { id: "house-001", name: "Emily White", party: "Democratic Party", partyShort: "DP", photo: "https://via.placeholder.com/150?text=Emily+White&bg=0066cc&text_color=ffffff", position: "houseOfReps", voteCount: 0 },
  { id: "house-002", name: "James Harris", party: "Republican Party", partyShort: "RP", photo: "https://via.placeholder.com/150?text=James+Harris&bg=cc0000&text_color=ffffff", position: "houseOfReps", voteCount: 0 },
  { id: "house-003", name: "Maria Garcia", party: "Independent", partyShort: "IND", photo: "https://via.placeholder.com/150?text=Maria+Garcia&bg=00cc00&text_color=ffffff", position: "houseOfReps", voteCount: 0 },
];

function toSafeVoter(row: PrismaVoter | null): Voter | null {
  if (!row) return null;
  return {
    id: String(row.id),
    nin: row.nin,
    name: row.name,
    dob: row.dob,
    email: row.email,
    state: row.state,
    isAdmin: row.isAdmin,
    hasVoted: row.hasVoted,
    votedAt: row.votedAt,
    receiptToken: row.receiptToken,
  };
}

function isPosition(value: string): value is Position {
  return POSITIONS.some((position) => position === value);
}

export async function getVoterById(id: string): Promise<Voter | null> {
  if (!/^\d+$/.test(id)) return null;
  const voter = await prisma.voter.findUnique({ where: { id: Number(id) } });
  return toSafeVoter(voter);
}

export async function getVoterByNIN(nin: string): Promise<Voter | null> {
  return toSafeVoter(await prisma.voter.findUnique({ where: { nin } }));
}

export async function getVoterByEmail(email: string): Promise<Voter | null> {
  return toSafeVoter(await prisma.voter.findUnique({ where: { email } }));
}

export async function getVoterCredentialsByEmail(email: string): Promise<VoterCredentials | null> {
  const voter = await prisma.voter.findUnique({ where: { email } });
  if (!voter) return null;
  return { ...toSafeVoter(voter)!, password: voter.password };
}

export async function registerVoter(input: {
  nin: string;
  name: string;
  dob: string;
  email?: string | null;
  password: string;
  state: string;
  isAdmin?: boolean;
}): Promise<Voter> {
  const hashedPassword = await bcrypt.hash(input.password || "123456", 10);
  const voter = await prisma.voter.create({
    data: {
      nin: input.nin,
      name: input.name,
      dob: input.dob,
      email: input.email || null,
      password: hashedPassword,
      state: input.state,
      isAdmin: input.isAdmin ?? false,
    },
  });
  const safeVoter = toSafeVoter(voter);
  if (!safeVoter) throw new Error("The voter record was not returned after registration.");
  return safeVoter;
}

export async function validateVoter(input: { nin: string; dob: string; state: string }) {
  const voter = await getVoterByNIN(input.nin);
  if (!voter) {
    return { success: false, message: "NIN not found in voter registry. You are not registered to vote." };
  }
  if (voter.hasVoted) {
    return { success: false, message: "You have already voted. Duplicate voting is not allowed." };
  }
  if (voter.dob !== input.dob) {
    return { success: false, message: "Date of birth does not match our records." };
  }
  if (voter.state.toLowerCase() !== input.state.toLowerCase()) {
    return { success: false, message: "State does not match our records." };
  }

  return {
    success: true,
    message: "Voter authenticated successfully",
    voter: {
      id: voter.id || voter.nin,
      nin: voter.nin,
      fullName: voter.name || "Registered Voter",
      dob: voter.dob,
      state: voter.state,
      hasVoted: voter.hasVoted,
      isAdmin: voter.isAdmin,
    },
  };
}

export async function getCandidates(position?: string): Promise<Candidate[]> {
  const where = position === undefined
    ? undefined
    : isPosition(position) ? { position } : { position: "__invalid_position__" };
  const candidates = await prisma.candidate.findMany({
    where,
    orderBy: position ? { name: "asc" } : [{ position: "asc" }, { name: "asc" }],
  });
  return candidates.map((candidate: PrismaCandidate) => {
    if (!isPosition(candidate.position)) {
      throw new Error(`Candidate ${candidate.id} has an invalid election position.`);
    }
    return { ...candidate, position: candidate.position };
  });
}

export async function initializeCandidates(candidates: Candidate[]): Promise<void> {
  if (candidates.length === 0) return;
  await prisma.candidate.createMany({
    data: candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      partyShort: candidate.partyShort,
      photo: candidate.photo,
      position: candidate.position,
      voteCount: candidate.voteCount,
    })),
    skipDuplicates: true,
  });
}

export type BallotSelections = Partial<Record<Position, string | null>>;

export async function castBallot(input: { voterNIN: string; selections: BallotSelections }) {
  const timestamp = new Date();
  const receiptToken = `RCP-${randomBytes(24).toString("base64url")}`;

  if (!POSITIONS.every((position) => typeof input.selections[position] === "string")) {
    return { success: false, message: "A valid candidate must be selected for every ballot position." };
  }

  return prisma.$transaction(async (transaction) => {
    const voter = await transaction.voter.findUnique({
      where: { nin: input.voterNIN },
      select: { id: true, hasVoted: true },
    });
    if (!voter) return { success: false, message: "Voter not found." };
    if (voter.hasVoted) {
      return { success: false, message: "You have already voted. Duplicate voting is not allowed." };
    }

    const claim = await transaction.voter.updateMany({
      where: { id: voter.id, hasVoted: false },
      data: { hasVoted: true, votedAt: timestamp, receiptToken },
    });
    if (claim.count !== 1) {
      return { success: false, message: "You have already voted. Duplicate voting is not allowed." };
    }

    await transaction.vote.create({
      data: {
        voterNin: input.voterNIN,
        receiptToken,
        president: input.selections.president ?? null,
        governor: input.selections.governor ?? null,
        senator: input.selections.senator ?? null,
        houseOfReps: input.selections.houseOfReps ?? null,
        timestamp,
      },
    });

    for (const position of POSITIONS) {
      const candidateId = input.selections[position];
      if (!candidateId) continue;
      const update = await transaction.candidate.updateMany({
        where: { id: candidateId, position },
        data: { voteCount: { increment: 1 } },
      });
      if (update.count !== 1) {
        throw new Error(`The selected candidate for ${position} does not exist.`);
      }
    }

    return { success: true, message: "Vote cast successfully!", receiptToken };
  });
}

export async function getResults() {
  const [candidateGroups, totalVoted, totalRegistered] = await Promise.all([
    Promise.all(POSITIONS.map((position) => prisma.candidate.findMany({
      where: { position },
      orderBy: [{ voteCount: "desc" }, { name: "asc" }],
    }))),
    prisma.voter.count({ where: { hasVoted: true } }),
    prisma.voter.count(),
  ]);

  const results = Object.fromEntries(POSITIONS.map((position, index) => [
    position,
    candidateGroups[index].map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      partyShort: candidate.partyShort,
      photo: candidate.photo,
      votes: candidate.voteCount,
    })),
  ])) as Record<Position, Array<Omit<Candidate, "position" | "voteCount"> & { votes: number }>>;
  const turnoutPercentage = totalRegistered > 0
    ? ((totalVoted / totalRegistered) * 100).toFixed(2)
    : "0.00";

  return { results, stats: { totalVoted, totalRegistered, turnoutPercentage } };
}

export async function getVoteByReceiptToken(token: string) {
  const vote = await prisma.vote.findUnique({ where: { receiptToken: token } });
  if (!vote) return null;
  return {
    receiptToken: vote.receiptToken,
    voterNin: vote.voterNin,
    president: vote.president,
    governor: vote.governor,
    senator: vote.senator,
    houseOfReps: vote.houseOfReps,
    timestamp: vote.timestamp,
  };
}

export async function isAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function ensureDatabaseReady(): Promise<void> {
  await prisma.$connect();
  if (await prisma.candidate.count() === 0) {
    await initializeCandidates(defaultCandidates);
  }
}
