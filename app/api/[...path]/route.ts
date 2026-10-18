import { randomInt } from "node:crypto";
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
  getVoterByEmail,
  getVoterById,
  getVoterByNIN,
  getVoterCredentialsByEmail,
  getVoteByReceiptToken,
  initializeCandidates,
  isAvailable,
  POSITIONS,
  registerVoter,
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
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

function signToken(voter: { id: string; isAdmin: boolean }): string {
  return jwt.sign({ voter }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "5h" });
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
      if (action === "nextjs") return await exportProject("e-voting-nextjs-app.zip");
      if (action === "project") return await exportProject("e-voting-full-project.zip");
    }

    if (resource === "email" && action === "send-receipt" && method === "POST") {
      const body = await readBody(request);
      const email = stringField(body, "email");
      const receiptToken = stringField(body, "receiptToken");
      if (!email || !receiptToken) {
        return json({ success: false, message: "Please provide recipient email and receipt token." }, 400);
      }

      const details = await sendReceiptEmail({
        email,
        receiptToken,
        voterNIN: stringField(body, "voterNIN") || "12345678901",
        voterName: stringField(body, "voterName") || "Voter",
        timestamp: `${new Date().toLocaleString()} WAT`,
      });
      return json({ success: true, message: `Official voting receipt sent successfully to ${email}`, details });
    }

    if (resource === "results" && action === "visibility" && method === "GET") {
      return json({ success: true, visible: getResultsVisibility() });
    }
    if (resource === "results" && action === "toggle-visibility" && method === "POST") {
      return json({ success: true, visible: toggleResultsVisibility() });
    }
    if (resource === "results" && action === "set-visibility" && method === "POST") {
      const body = await readBody(request);
      if (typeof body.visible !== "boolean") {
        return json({ success: false, message: "Please provide a boolean value for visibility." }, 400);
      }
      setResultsVisibility(body.visible);
      return json({ success: true, visible: body.visible });
    }

    await ensureDatabaseReady();

    if (resource === "auth" && method === "POST" && (action === "register" || action === "login")) {
      const body = await readBody(request);
      const email = stringField(body, "email");
      const password = stringField(body, "password");
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
        return json({ message: "A valid email and password are required." }, 400);
      }

      if (action === "login") {
        const voter = await getVoterCredentialsByEmail(email);
        if (!voter || !(await bcrypt.compare(password, voter.password))) {
          return json({ message: "Invalid credentials" }, 400);
        }
        return json({ token: signToken({ id: voter.id || voter.nin, isAdmin: voter.isAdmin }) });
      }

      const name = stringField(body, "name");
      const nin = stringField(body, "nin");
      const dob = stringField(body, "dob");
      const state = stringField(body, "state");
      if (!name || name.length < 3 || !nin || nin.length !== 16 || !dob || !state || password.length < 6) {
        return json({ message: "Please provide valid registration details." }, 400);
      }
      if (await getVoterByEmail(email)) {
        return json({ message: "Voter with that email already exists" }, 400);
      }
      if (await getVoterByNIN(nin)) {
        return json({ message: "Voter with that NIN already exists" }, 400);
      }
      const voter = await registerVoter({ nin, name, dob, email, password, state });
      return json({ token: signToken({ id: voter.id || voter.nin, isAdmin: voter.isAdmin }) });
    }

    if (resource === "voters" && action === "validate" && method === "POST") {
      const body = await readBody(request);
      const nin = stringField(body, "nin");
      const dob = stringField(body, "dob");
      const state = stringField(body, "state");
      if (!nin || !dob || !state) {
        return json({ success: false, message: "Please provide NIN, date of birth, and state." }, 400);
      }
      const result = await validateVoter({ nin, dob, state });
      return json(result, result.success ? 200 : 400);
    }

    if (resource === "voters" && action === "register" && method === "POST") {
      const body = await readBody(request);
      const fullName = stringField(body, "fullName");
      const nin = stringField(body, "nin");
      const dob = stringField(body, "dob");
      const state = stringField(body, "state");
      const email = stringField(body, "email") || `${nin || ""}@evoting.local`;
      const password = stringField(body, "password") || `Voter-${randomInt(100_000, 1_000_000)}`;
      if (!nin || !/^\d{11}$/.test(nin)) {
        return json({ success: false, message: "NIN must be exactly 11 digits." }, 400);
      }
      if (!fullName || !dob || !state) {
        return json({ success: false, message: "Please provide all required fields." }, 400);
      }
      if (await getVoterByNIN(nin)) {
        return json({ success: false, message: "This NIN is already registered." }, 400);
      }
      await registerVoter({ nin, name: fullName, dob, email, password, state });
      return json({ success: true, message: "Registration successful! You can now login to vote." });
    }

    if (resource === "voters" && action === "status" && parameter && method === "GET") {
      const voter = await getVoterByNIN(parameter);
      if (!voter) {
        return json({ success: false, message: "Voter not found in registry." }, 404);
      }
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
      const claims = getClaims(request);
      if (!claims) return unauthorized();
      const voter = await getVoterById(action) || await getVoterByNIN(action);
      if (!voter) return json({ success: false, message: "Voter not found" }, 404);
      if (!claims.isAdmin) {
        return json({ success: false, message: "Access denied: Not an administrator" }, 403);
      }
      return json({ success: true, hasVoted: voter.hasVoted, votedAt: voter.votedAt, voter });
    }

    if (resource === "candidates" && method === "GET" && action === "position" && parameter) {
      return json({ success: true, candidates: await getCandidates(parameter) });
    }
    if (resource === "candidates" && method === "GET" && !action) {
      return json({ success: true, candidates: await getCandidates() });
    }
    if (resource === "candidates" && action === "initialize" && method === "POST") {
      const body = await readBody(request);
      const candidates = Array.isArray(body.candidates) ? body.candidates.map(candidateFrom) : [];
      if (candidates.length === 0 || candidates.some((candidate) => candidate === null)) {
        return json({ success: false, message: "No valid candidates provided." }, 400);
      }
      await initializeCandidates(candidates as Candidate[]);
      return json({ success: true, message: "Candidates initialized successfully" }, 201);
    }

    if (resource === "votes" && method === "POST" && !action) {
      const body = await readBody(request);
      const voterNIN = stringField(body, "voterNIN");
      const selections = body.selections;
      if (!voterNIN || !selections || typeof selections !== "object" || Array.isArray(selections)) {
        return json({ success: false, message: "Please provide voter NIN and selections." }, 400);
      }
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
