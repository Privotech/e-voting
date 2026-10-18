import { registeredVoters } from "./voterData";

export interface VoterToken {
  tokenId: string;
  tokenHash: string;
  maskedNIN: string;
  rawNIN: string;
  state: string;
  issuedAt: string;
  status: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(item: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value) return value;
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

/**
 * Fast synchronous SHA-256 style hash generator for Voter ID tokens
 * Produces a deterministic 64-character hex hash from voter input and salt.
 */
export function hashVoterID(voterId: string | number, salt = "INEC_E_VOTING_SALT_2024"): string {
  const str = `${voterId.toString().trim()}:${salt}`;
  let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = (Math.imul(h1, 31) >>> 0).toString(16).padStart(8, '0');
  const hex4 = (Math.imul(h2, 37) >>> 0).toString(16).padStart(8, '0');
  const hex5 = (Math.imul(h1 ^ h2, 41) >>> 0).toString(16).padStart(8, '0');
  const hex6 = (Math.imul(h1 + h2, 43) >>> 0).toString(16).padStart(8, '0');
  const hex7 = (Math.imul(h1 - h2, 47) >>> 0).toString(16).padStart(8, '0');
  const hex8 = (Math.imul(h1 * 3, 53) >>> 0).toString(16).padStart(8, '0');

  return `${hex1}${hex2}${hex3}${hex4}${hex5}${hex6}${hex7}${hex8}`;
}

/**
 * Generates formatted secure Voter Token String (e.g. VTK-8F3A-9E02-71B4)
 */
export function generateFormattedTokenId(): string {
  const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const p3 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VTK-${p1}-${p2}-${p3}`;
}

/**
 * Generates a batch list of secure, hashed voter ID tokens for administrators
 * @param {number} count - Number of tokens to generate
 * @param {string} state - State/Region code
 */
export function generateBatchVoterTokens(count = 10, state = "Lagos"): VoterToken[] {
  const tokens: VoterToken[] = [];
  const timestamp = new Date().toISOString();

  for (let i = 0; i < count; i++) {
    const rawNIN = `${Math.floor(10000000000 + Math.random() * 89999999999)}`;
    const tokenId = generateFormattedTokenId();
    const tokenHash = hashVoterID(rawNIN);
    const maskedNIN = `${rawNIN.slice(0, 3)}****${rawNIN.slice(-4)}`;

    tokens.push({
      tokenId,
      tokenHash,
      maskedNIN,
      rawNIN,
      state,
      issuedAt: timestamp,
      status: "Active (Unused)"
    });
  }

  return tokens;
}

/**
 * Registers generated or imported token hashes into system registeredVoters Set
 */
export function registerTokensToSystem(tokensList: Array<Partial<VoterToken>>) {
  let addedCount = 0;
  let duplicateCount = 0;

  tokensList.forEach((item) => {
    // Check key rawNIN, tokenId, or tokenHash
    const primaryKey = item.rawNIN || item.tokenId || item.tokenHash;
    if (primaryKey) {
      if (registeredVoters.has(primaryKey)) {
        duplicateCount++;
      } else {
        registeredVoters.add(primaryKey);
        addedCount++;
      }
    }
  });

  // Sync to localStorage
  localStorage.setItem("registeredVoters", JSON.stringify([...registeredVoters]));

  return { addedCount, duplicateCount, total: registeredVoters.size };
}

/**
 * Parse uploaded JSON or CSV file containing voter tokens or raw voter IDs
 */
export function parseUploadedVoterList(fileContent: string, fileName = ""): VoterToken[] {
  const isJSON = fileName.toLowerCase().endsWith(".json") || fileContent.trim().startsWith("[") || fileContent.trim().startsWith("{");
  const parsedTokens: VoterToken[] = [];

  if (isJSON) {
    try {
      const data: unknown = JSON.parse(fileContent);
      const items: unknown[] = Array.isArray(data)
        ? data
        : isRecord(data) && Array.isArray(data.voters)
          ? data.voters
          : isRecord(data) && Array.isArray(data.tokens)
            ? data.tokens
            : [data];
      
      items.forEach((value, idx) => {
        const item = isRecord(value) ? value : {};
        const rawId = readString(item, "rawNIN", "voterId", "nin", "id") || `UPLOAD-${idx + 1000}`;
        const tokenId = readString(item, "tokenId") || generateFormattedTokenId();
        const tokenHash = readString(item, "tokenHash") || hashVoterID(rawId);
        const masked = readString(item, "maskedNIN") || (rawId.length >= 7 ? `${rawId.slice(0, 3)}****${rawId.slice(-4)}` : rawId);

        parsedTokens.push({
          tokenId,
          tokenHash,
          maskedNIN: masked,
          rawNIN: rawId,
          state: readString(item, "state") || "Uploaded List",
          issuedAt: readString(item, "issuedAt") || new Date().toISOString(),
          status: "Active (Unused)"
        });
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid JSON input.";
      throw new Error(`Failed to parse JSON file: ${message}`);
    }
  } else {
    // CSV Parsing
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) throw new Error("Uploaded CSV file is empty.");

    // Skip header if detected
    const hasHeader = lines[0].toLowerCase().includes("voter") || lines[0].toLowerCase().includes("nin") || lines[0].toLowerCase().includes("token");
    const dataLines = hasHeader ? lines.slice(1) : lines;

    dataLines.forEach((line, idx) => {
      const parts = line.split(",").map(p => p.trim().replace(/^["']|["']$/g, ""));
      const rawId = parts[0] || `IMPORT-${idx + 1000}`;
      const state = parts[1] || "Uploaded List";
      const tokenId = generateFormattedTokenId();
      const tokenHash = hashVoterID(rawId);
      const masked = rawId.length >= 7 ? `${rawId.slice(0, 3)}****${rawId.slice(-4)}` : rawId;

      parsedTokens.push({
        tokenId,
        tokenHash,
        maskedNIN: masked,
        rawNIN: rawId,
        state,
        issuedAt: new Date().toISOString(),
        status: "Active (Unused)"
      });
    });
  }

  return parsedTokens;
}
