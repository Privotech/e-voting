import "server-only";
import { randomInt } from "node:crypto";
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import bcrypt from "bcryptjs";

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

interface VoterRow extends Voter {
  password: string;
}

type SqlValue = string | number | boolean | Date | null;
type SafeVoter = Omit<VoterRow, "password">;

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

const globalDatabase = globalThis as typeof globalThis & {
  votingPool?: Pool;
  votingSchemaPromise?: Promise<void>;
};

export function getPool(): Pool {
  if (globalDatabase.votingPool) {
    return globalDatabase.votingPool;
  }

  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    throw new Error("Set DATABASE_URL or NEON_DATABASE_URL to connect the voting database.");
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL client error:", error.message);
  });
  globalDatabase.votingPool = pool;
  return pool;
}

export async function query<Row extends QueryResultRow = QueryResultRow>(
  text: string,
  params: SqlValue[] = [],
): Promise<QueryResult<Row>> {
  return getPool().query<Row>(text, params);
}

function toSafeVoter(row: VoterRow | undefined): SafeVoter | null {
  if (!row) return null;
  const { password: _password, ...voter } = row;
  return voter;
}

export async function getVoterById(id: string): Promise<SafeVoter | null> {
  const result = await query<VoterRow>("SELECT * FROM voters WHERE id = $1", [id]);
  return toSafeVoter(result.rows[0]);
}

export async function getVoterByNIN(nin: string): Promise<SafeVoter | null> {
  const result = await query<VoterRow>("SELECT * FROM voters WHERE nin = $1", [nin]);
  return toSafeVoter(result.rows[0]);
}

export async function getVoterByEmail(email: string): Promise<SafeVoter | null> {
  const result = await query<VoterRow>("SELECT * FROM voters WHERE email = $1", [email]);
  return toSafeVoter(result.rows[0]);
}

export async function getVoterCredentialsByEmail(email: string): Promise<VoterRow | null> {
  const result = await query<VoterRow>("SELECT * FROM voters WHERE email = $1", [email]);
  return result.rows[0] ?? null;
}

export async function registerVoter(input: {
  nin: string;
  name: string;
  dob: string;
  email: string;
  password: string;
  state: string;
  isAdmin?: boolean;
}): Promise<SafeVoter> {
  const hashedPassword = await bcrypt.hash(input.password || "123456", 10);
  const result = await query<VoterRow>(
    `INSERT INTO voters (id, nin, name, dob, email, password, state, "isAdmin", "hasVoted")
     VALUES ($1, $1, $2, $3, $4, $5, $6, $7, false) RETURNING *`,
    [input.nin, input.name, input.dob, input.email, hashedPassword, input.state, input.isAdmin ?? false],
  );
  const voter = toSafeVoter(result.rows[0]);
  if (!voter) throw new Error("The voter record was not returned after registration.");
  return voter;
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
      isAdmin: voter.isAdmin || false,
    },
  };
}

export async function getCandidates(position?: string): Promise<Candidate[]> {
  const result = position
    ? await query<Candidate>("SELECT * FROM candidates WHERE position = $1 ORDER BY name ASC", [position])
    : await query<Candidate>("SELECT * FROM candidates ORDER BY position ASC, name ASC");
  return result.rows;
}

export async function initializeCandidates(candidates: Candidate[]): Promise<void> {
  if (candidates.length === 0) return;
  const values: string[] = [];
  const params: SqlValue[] = [];
  candidates.forEach((candidate, index) => {
    const offset = index * 7;
    values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`);
    params.push(candidate.id, candidate.name, candidate.party, candidate.partyShort, candidate.photo, candidate.position, candidate.voteCount || 0);
  });
  await query(
    `INSERT INTO candidates (id, name, party, "partyShort", photo, position, "voteCount")
     VALUES ${values.join(", ")} ON CONFLICT (id) DO NOTHING`,
    params,
  );
}

export type BallotSelections = Partial<Record<Position, string | null>>;

export async function castBallot(input: { voterNIN: string; selections: BallotSelections }) {
  const client: PoolClient = await getPool().connect();
  let transactionOpen = false;

  try {
    await client.query("BEGIN");
    transactionOpen = true;

    const voterResult = await client.query<{ "hasVoted": boolean }>(
      'SELECT "hasVoted" FROM voters WHERE nin = $1 FOR UPDATE',
      [input.voterNIN],
    );
    if (!voterResult.rows[0]) {
      await client.query("ROLLBACK");
      transactionOpen = false;
      return { success: false, message: "Voter not found." };
    }
    if (voterResult.rows[0].hasVoted) {
      await client.query("ROLLBACK");
      transactionOpen = false;
      return { success: false, message: "You have already voted. Duplicate voting is not allowed." };
    }

    const timestamp = new Date();
    const receiptToken = `RCP-${timestamp.getTime()}-${randomInt(0, 10_000)}`;
    const selections = input.selections;
    await client.query(
      `INSERT INTO votes (voter_nin, receipt_token, president, governor, senator, house_of_reps, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        input.voterNIN,
        receiptToken,
        selections.president ?? null,
        selections.governor ?? null,
        selections.senator ?? null,
        selections.houseOfReps ?? null,
        timestamp,
      ],
    );

    for (const candidateId of Object.values(selections)) {
      if (candidateId) {
        await client.query('UPDATE candidates SET "voteCount" = "voteCount" + 1 WHERE id = $1', [candidateId]);
      }
    }

    await client.query(
      'UPDATE voters SET "hasVoted" = true, "votedAt" = NOW(), "receiptToken" = $1 WHERE nin = $2',
      [receiptToken, input.voterNIN],
    );
    await client.query("COMMIT");
    transactionOpen = false;
    return { success: true, message: "Vote cast successfully!", receiptToken };
  } catch (error) {
    if (transactionOpen) {
      await client.query("ROLLBACK");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function getResults() {
  const results = {} as Record<Position, Array<Omit<Candidate, "position" | "voteCount"> & { votes: number }>>;
  for (const position of POSITIONS) {
    const result = await query<Omit<Candidate, "position">>(
      `SELECT id, name, party, "partyShort", photo, "voteCount"
       FROM candidates WHERE position = $1 ORDER BY "voteCount" DESC, name ASC`,
      [position],
    );
    results[position] = result.rows.map(({ voteCount, ...candidate }) => ({
      ...candidate,
      votes: voteCount || 0,
    }));
  }

  const [voted, registered] = await Promise.all([
    query<{ total: string }>('SELECT COUNT(*) AS total FROM voters WHERE "hasVoted" = true'),
    query<{ total: string }>("SELECT COUNT(*) AS total FROM voters"),
  ]);
  const totalVoted = Number.parseInt(voted.rows[0]?.total ?? "0", 10);
  const totalRegistered = Number.parseInt(registered.rows[0]?.total ?? "0", 10);
  const turnoutPercentage = totalRegistered > 0
    ? ((totalVoted / totalRegistered) * 100).toFixed(2)
    : "0.00";

  return { results, stats: { totalVoted, totalRegistered, turnoutPercentage } };
}

export async function getVoteByReceiptToken(token: string) {
  const result = await query<{
    receiptToken: string;
    president: string | null;
    governor: string | null;
    senator: string | null;
    houseOfReps: string | null;
    timestamp: Date;
  }>(
    `SELECT receipt_token AS "receiptToken", president, governor, senator,
     house_of_reps AS "houseOfReps", timestamp FROM votes WHERE receipt_token = $1`,
    [token],
  );
  return result.rows[0] ?? null;
}

export async function isAvailable(): Promise<boolean> {
  try {
    await query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

async function createSchema(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS voters (
      id VARCHAR(255) PRIMARY KEY,
      nin VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      dob VARCHAR(255) NOT NULL,
      state VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      "isAdmin" BOOLEAN DEFAULT FALSE,
      "hasVoted" BOOLEAN DEFAULT FALSE,
      "votedAt" TIMESTAMP,
      "receiptToken" VARCHAR(255),
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS candidates (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      party VARCHAR(255) NOT NULL,
      "partyShort" VARCHAR(255) NOT NULL,
      photo TEXT NOT NULL,
      position VARCHAR(255) NOT NULL CHECK (position IN ('president', 'governor', 'senator', 'houseOfReps')),
      "voteCount" INTEGER DEFAULT 0,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS votes (
      id SERIAL PRIMARY KEY,
      voter_nin VARCHAR(255) NOT NULL REFERENCES voters(nin),
      receipt_token VARCHAR(255) UNIQUE NOT NULL,
      president VARCHAR(255),
      governor VARCHAR(255),
      senator VARCHAR(255),
      house_of_reps VARCHAR(255),
      timestamp TIMESTAMP DEFAULT NOW(),
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `);
  await query("CREATE INDEX IF NOT EXISTS idx_voters_nin ON voters(nin)");
  await query("CREATE INDEX IF NOT EXISTS idx_voters_email ON voters(email)");
  await query("CREATE INDEX IF NOT EXISTS idx_candidates_position ON candidates(position)");
  await query("CREATE INDEX IF NOT EXISTS idx_votes_receipt ON votes(receipt_token)");
  await query("CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_nin)");
  await query('ALTER TABLE voters ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT FALSE');
  await query('ALTER TABLE voters ADD COLUMN IF NOT EXISTS "hasVoted" BOOLEAN DEFAULT FALSE');
  await query('ALTER TABLE voters ADD COLUMN IF NOT EXISTS "votedAt" TIMESTAMP');
  await query('ALTER TABLE voters ADD COLUMN IF NOT EXISTS "receiptToken" VARCHAR(255)');

  const candidateCount = await query<{ total: string }>("SELECT COUNT(*) AS total FROM candidates");
  if (Number.parseInt(candidateCount.rows[0]?.total ?? "0", 10) === 0) {
    await initializeCandidates(defaultCandidates);
  }
}

export async function ensureDatabaseReady(): Promise<void> {
  if (!globalDatabase.votingSchemaPromise) {
    globalDatabase.votingSchemaPromise = createSchema().catch((error: unknown) => {
      globalDatabase.votingSchemaPromise = undefined;
      throw error;
    });
  }
  await globalDatabase.votingSchemaPromise;
}
