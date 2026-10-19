import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import JSZip from "jszip";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import {
  castBallot,
  ensureDatabaseReady,
  getCandidates,
  getResults,
  getVoterById,
  getVoterByNIN,
  getVoterCredentialsByEmail,
  getVoteByReceiptToken,
  initializeCandidates,
  isAvailable,
  POSITIONS,
  validateVoter,
  type BallotSelections,
  type Candidate,
} from "@/lib/db";
import { sendReceiptEmail } from "@/lib/email";
import { getResultsVisibility, setResultsVisibility, toggleResultsVisibility } from "@/lib/store";

export const runtime = "nodejs";

type Body = Record<string, unknown>;
interface VoterClaims {
  id: string;
  isAdmin: boolean;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  return secret;
}

class BadRequestError extends Error {}

function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status });
}

async function readBody(request: NextRequest): Promise<Body> {
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body as Body;
    }
  } catch {
    throw new BadRequestError("Invalid JSON request body.");
  }
  throw new BadRequestError("A JSON object is required.");
}

function stringField(body: Body, key: string): string | null {
  return typeof body[key] === "string" ? body[key].trim() : null;
}

function getClaims(request: NextRequest): VoterClaims | null {
  const token = request.headers.get("x-auth-token");
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === "string" || !decoded.voter || typeof decoded.voter.id !== "string") {
      return null;
    }
    return {
      id: decoded.voter.id,
      isAdmin: decoded.voter.isAdmin === true,
    };
  } catch {
    return null;
  }
}

function unauthorized(): NextResponse {
  return json({ message: "No token, authorization denied" }, 401);
}

function forbidden(): NextResponse {
  return json({ success: false, message: "Administrator access is required." }, 403);
}

async function authorizeAdmin(request: NextRequest): Promise<NextResponse | null> {
  const claims = getClaims(request);
  if (!claims) return unauthorized();
  if (!claims.isAdmin) return forbidden();

  await ensureDatabaseReady();
  const voter = await getVoterById(claims.id);
  return voter?.isAdmin ? null : forbidden();
}

function signToken(voter: { id: string; isAdmin: boolean }): string {
  return jwt.sign({ voter }, getJwtSecret(), { expiresIn: "30m" });
}

function candidateFrom(value: unknown): Candidate | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.name !== "string" ||
    typeof candidate.party !== "string" ||
    typeof candidate.partyShort !== "string" ||
    typeof candidate.photo !== "string" ||
    typeof candidate.position !== "string" ||
    !POSITIONS.includes(candidate.position as (typeof POSITIONS)[number])
  ) {
    return null;
  }
  return {
    id: candidate.id,
    name: candidate.name,
    party: candidate.party,
    partyShort: candidate.partyShort,
    photo: candidate.photo,
    position: candidate.position as Candidate["position"],
    voteCount: typeof candidate.voteCount === "number" ? candidate.voteCount : 0,
  };
}

function exportExcluded(name: string): boolean {
  return name === "node_modules" ||
    name === ".git" ||
    name === ".next" ||
    name === ".cache" ||
    name === "dist" ||
    name === "build" ||
    name.startsWith(".env") ||
    name.endsWith(".pem") ||
    name.endsWith(".key");
}

function addDirectoryToZip(zip: JSZip, directory: string, zipPath = ""): void {
  for (const name of readdirSync(directory)) {
    if (exportExcluded(name)) continue;
    const fullPath = path.join(directory, name);
    const relativePath = zipPath ? `${zipPath}/${name}` : name;
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      addDirectoryToZip(zip, fullPath, relativePath);
    } else if (stat.isFile()) {
      zip.file(relativePath, readFileSync(fullPath));
    }
  }
}

async function exportProject(filename: string): Promise<NextResponse> {
  const zip = new JSZip();
  addDirectoryToZip(zip, process.cwd());
  const archive = await zip.generateAsync({ type: "nodebuffer" });
  return new NextResponse(new Blob([new Uint8Array(archive)]), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

async function handleRequest(request: NextRequest): Promise<NextResponse> {
  const segments = request.nextUrl.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  const [resource, action, parameter] = segments;
  const method = request.method;

  try {
    if (resource === "export" && method === "GET") {
      const denied = await authorizeAdmin(request);
      if (denied) return denied;
      if (action === "nextjs") return await exportProject("e-voting-nextjs-app.zip");
      if (action === "project") return await exportProject("e-voting-full-project.zip");
    }

    if (resource === "email" && action === "send-receipt" && method === "POST") {
      const claims = getClaims(request);
      if (!claims) return unauthorized();
      const body = await readBody(request);
      const email = stringField(body, "email")?.toLowerCase() ?? null;
      const receiptToken = stringField(body, "receiptToken");
      if (!email || !receiptToken) {
        return json({ success: false, message: "Please provide recipient email and receipt token." }, 400);
      }

      await ensureDatabaseReady();
      const voter = await getVoterById(claims.id);
      const vote = await getVoteByReceiptToken(receiptToken);
      if (!voter || !voter.email || voter.email.toLowerCase() !== email.toLowerCase() ||
        vote?.voterNin !== voter.nin || voter.receiptToken !== receiptToken) {
        return forbidden();
      }

      const details = await sendReceiptEmail({
        email,
        receiptToken,
        voterNIN: voter.nin,
        voterName: voter.name,
        timestamp: `${new Date().toLocaleString()} WAT`,
      });
      return json({ success: true, message: `Official voting receipt sent successfully to ${email}`, details });
    }

    if (resource === "results" && action === "visibility" && method === "GET") {
      return json({ success: true, visible: getResultsVisibility() });
    }
    if (resource === "results" && action === "toggle-visibility" && method === "POST") {
      const denied = await authorizeAdmin(request);
      if (denied) return denied;
      return json({ success: true, visible: toggleResultsVisibility() });
    }
    if (resource === "results" && action === "set-visibility" && method === "POST") {
      const denied = await authorizeAdmin(request);
      if (denied) return denied;
      const body = await readBody(request);
      if (typeof body.visible !== "boolean") {
        return json({ success: false, message: "Please provide a boolean value for visibility." }, 400);
      }
      setResultsVisibility(body.visible);
      return json({ success: true, visible: body.visible });
    }

    await ensureDatabaseReady();

    if (resource === "auth" && method === "POST" && (action === "register" || action === "login")) {
      if (action === "register") {
        return json({ message: "Public account creation is disabled. Voter records must be provisioned by the election authority." }, 403);
      }
      const body = await readBody(request);
      const email = stringField(body, "email")?.toLowerCase() ?? null;
      const password = stringField(body, "password");
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
        return json({ message: "A valid email and password are required." }, 400);
      }

      if (action === "login") {
        const voter = await getVoterCredentialsByEmail(email);
        if (!voter || !(await bcrypt.compare(password, voter.password))) {
          return json({ message: "Invalid credentials" }, 401);
        }
        return json({
          token: signToken({ id: voter.id, isAdmin: voter.isAdmin }),
          isAdmin: voter.isAdmin,
          name: voter.name,
          email: voter.email,
        });
      }
    }

    if (resource === "voters" && action === "validate" && method === "POST") {
      const body = await readBody(request);
      const nin = stringField(body, "nin");
      const dob = stringField(body, "dob");
      const state = stringField(body, "state");
      if (!nin || !/^\d{11}$/.test(nin) || !dob || !state) {
        return json({ success: false, message: "Please provide an 11-digit NIN, date of birth, and state." }, 400);
      }
      const result = await validateVoter({ nin, dob, state });
      if (!result.success || !result.voter) return json(result, 400);
      return json({
        ...result,
        token: signToken({ id: result.voter.id, isAdmin: false }),
      });
    }

    if (resource === "voters" && action === "register" && method === "POST") {
      return json({
        success: false,
        message: "Public voter registration is disabled. Contact the election authority to be added to the verified voter roll.",
      }, 403);
    }

    if (resource === "voters" && action === "status" && parameter && method === "GET") {
      const claims = getClaims(request);
      if (!claims) return unauthorized();
      const voter = await getVoterByNIN(parameter);
      if (!voter) {
        return json({ success: false, message: "Voter not found in registry." }, 404);
      }
      if (voter.id !== claims.id) return forbidden();
      return json({
        success: true,
        nin: voter.nin,
        hasVoted: voter.hasVoted || false,
        votedAt: voter.votedAt || null,
        receiptToken: voter.receiptToken || null,
      });
    }

    if (resource === "voters" && !action && method === "GET") {
      const claims = getClaims(request);
      if (!claims) return unauthorized();
      const voter = await getVoterById(claims.id) || await getVoterByNIN(claims.id);
      if (!voter) return json({ message: "Voter not found in PostgreSQL DB" }, 404);
      return json(voter);
    }

    if (resource === "voters" && action && method === "GET") {
      const denied = await authorizeAdmin(request);
      if (denied) return denied;
      const voter = await getVoterById(action) || await getVoterByNIN(action);
      if (!voter) return json({ success: false, message: "Voter not found" }, 404);
      return json({ success: true, hasVoted: voter.hasVoted, votedAt: voter.votedAt, voter });
    }

    if (resource === "candidates" && method === "GET" && action === "position" && parameter) {
      return json({ success: true, candidates: await getCandidates(parameter) });
    }
    if (resource === "candidates" && method === "GET" && !action) {
      return json({ success: true, candidates: await getCandidates() });
    }
    if (resource === "candidates" && action === "initialize" && method === "POST") {
      const denied = await authorizeAdmin(request);
      if (denied) return denied;
      const body = await readBody(request);
      const candidates = Array.isArray(body.candidates) ? body.candidates.map(candidateFrom) : [];
      if (candidates.length === 0 || candidates.some((candidate) => candidate === null)) {
        return json({ success: false, message: "No valid candidates provided." }, 400);
      }
      await initializeCandidates(candidates as Candidate[]);
      return json({ success: true, message: "Candidates initialized successfully" }, 201);
    }

    if (resource === "votes" && method === "POST" && !action) {
      const claims = getClaims(request);
      if (!claims) return unauthorized();
      const body = await readBody(request);
      const voterNIN = stringField(body, "voterNIN");
      const selections = body.selections;
      if (!voterNIN || !selections || typeof selections !== "object" || Array.isArray(selections) ||
        Object.keys(selections).some((position) => !POSITIONS.includes(position as (typeof POSITIONS)[number])) ||
        !POSITIONS.every((position) => typeof (selections as Record<string, unknown>)[position] === "string")) {
        return json({ success: false, message: "Please provide a valid selection for every ballot position." }, 400);
      }
      const voter = await getVoterById(claims.id);
      if (!voter || voter.nin !== voterNIN) return forbidden();
      const result = await castBallot({
        voterNIN,
        selections: selections as BallotSelections,
      });
      return json(result, result.success ? 200 : 400);
    }

    if (resource === "votes" && action === "receipt" && parameter && method === "GET") {
      const vote = await getVoteByReceiptToken(parameter);
      if (!vote) {
        return json({ success: false, message: "Vote receipt token not found in PostgreSQL DB." }, 404);
      }
      return json({
        success: true,
        vote: {
          selections: {
            president: vote.president,
            governor: vote.governor,
            senator: vote.senator,
            houseOfReps: vote.houseOfReps,
          },
          timestamp: vote.timestamp,
        },
      });
    }

    if (resource === "results" && action === "position" && parameter && method === "GET") {
      if (!getResultsVisibility()) {
        return json({ success: false, message: "Results are not yet visible." }, 403);
      }
      const candidates = await getCandidates(parameter);
      const results = candidates.map(({ id, name, party, partyShort, photo, voteCount }) => ({
        id,
        name,
        party,
        partyShort,
        photo,
        votes: voteCount || 0,
      }));
      return json({ success: true, position: parameter, results });
    }

    if (resource === "results" && action === "comprehensive" && method === "GET") {
      if (!getResultsVisibility()) {
        return json({ success: false, message: "Results are not yet visible." }, 403);
      }
      const report = await getResults();
      return json({
        success: true,
        results: report.results,
        turnout: report.stats,
        isVisible: getResultsVisibility(),
        totalVotesCount: report.stats.totalVoted,
      });
    }

    if (resource === "results" && action === "turnout" && method === "GET") {
      if (!getResultsVisibility()) {
        return json({ success: false, message: "Results are not yet visible." }, 403);
      }
      const report = await getResults();
      return json({ success: true, turnout: report.stats });
    }

    if (resource === "health") {
      return json({
        status: "ok",
        database: await isAvailable() ? "postgresql" : "disconnected",
        message: "E-Voting application is running",
      });
    }

    return json({ message: "Not found" }, 404);
  } catch (error) {
    if (error instanceof BadRequestError) {
      return json({ message: error.message }, 400);
    }
    console.error("API request failed:", error);
    return json({ message: "Server error" }, 500);
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
