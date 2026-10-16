const { query, isAvailable } = require('./pgClient');
const bcrypt = require('bcryptjs');

const DEFAULT_CANDIDATES = [
  { id: 'pres-001', name: 'John Smith', party: 'Democratic Party', partyShort: 'DP', photo: 'https://via.placeholder.com/150?text=John+Smith&bg=0066cc&text_color=ffffff', position: 'president', voteCount: 0 },
  { id: 'pres-002', name: 'Sarah Johnson', party: 'Republican Party', partyShort: 'RP', photo: 'https://via.placeholder.com/150?text=Sarah+Johnson&bg=cc0000&text_color=ffffff', position: 'president', voteCount: 0 },
  { id: 'pres-003', name: 'Michael Brown', party: 'Independent', partyShort: 'IND', photo: 'https://via.placeholder.com/150?text=Michael+Brown&bg=00cc00&text_color=ffffff', position: 'president', voteCount: 0 },
  { id: 'gov-001', name: 'Alice Williams', party: 'Democratic Party', partyShort: 'DP', photo: 'https://via.placeholder.com/150?text=Alice+Williams&bg=0066cc&text_color=ffffff', position: 'governor', voteCount: 0 },
  { id: 'gov-002', name: 'Robert Davis', party: 'Republican Party', partyShort: 'RP', photo: 'https://via.placeholder.com/150?text=Robert+Davis&bg=cc0000&text_color=ffffff', position: 'governor', voteCount: 0 },
  { id: 'gov-003', name: 'Jennifer Miller', party: 'Independent', partyShort: 'IND', photo: 'https://via.placeholder.com/150?text=Jennifer+Miller&bg=00cc00&text_color=ffffff', position: 'governor', voteCount: 0 },
  { id: 'sen-001', name: 'Charles Anderson', party: 'Democratic Party', partyShort: 'DP', photo: 'https://via.placeholder.com/150?text=Charles+Anderson&bg=0066cc&text_color=ffffff', position: 'senator', voteCount: 0 },
  { id: 'sen-002', name: 'Patricia Taylor', party: 'Republican Party', partyShort: 'RP', photo: 'https://via.placeholder.com/150?text=Patricia+Taylor&bg=cc0000&text_color=ffffff', position: 'senator', voteCount: 0 },
  { id: 'sen-003', name: 'Daniel Martinez', party: 'Independent', partyShort: 'IND', photo: 'https://via.placeholder.com/150?text=Daniel+Martinez&bg=00cc00&text_color=ffffff', position: 'senator', voteCount: 0 },
  { id: 'house-001', name: 'Emily White', party: 'Democratic Party', partyShort: 'DP', photo: 'https://via.placeholder.com/150?text=Emily+White&bg=0066cc&text_color=ffffff', position: 'houseOfReps', voteCount: 0 },
  { id: 'house-002', name: 'James Harris', party: 'Republican Party', partyShort: 'RP', photo: 'https://via.placeholder.com/150?text=James+Harris&bg=cc0000&text_color=ffffff', position: 'houseOfReps', voteCount: 0 },
  { id: 'house-003', name: 'Maria Garcia', party: 'Independent', partyShort: 'IND', photo: 'https://via.placeholder.com/150?text=Maria+Garcia&bg=00cc00&text_color=ffffff', position: 'houseOfReps', voteCount: 0 }
];

const VOTERS_TABLE = 'voters';
const CANDIDATES_TABLE = 'candidates';
const VOTES_TABLE = 'votes';
const RESULTS_TABLE = 'results';

function mapVoter(row) {
  if (!row) return null;
  const { password, ...rest } = row;
  return rest;
}

async function getVoterById(id) {
  const res = await query(`SELECT * FROM ${VOTERS_TABLE} WHERE id = $1`, [id]);
  return mapVoter(res.rows[0]);
}

async function getVoterByNIN(nin) {
  const res = await query(`SELECT * FROM ${VOTERS_TABLE} WHERE nin = $1`, [nin]);
  return mapVoter(res.rows[0]);
}

async function getVoterByEmail(email) {
  const res = await query(`SELECT * FROM ${VOTERS_TABLE} WHERE email = $1`, [email]);
  return mapVoter(res.rows[0]);
}

async function registerVoter({ nin, name, dob, email, password, state, isAdmin = false }) {
  const hashedPassword = await bcrypt.hash(password || '123456', 10);
  const res = await query(
    `INSERT INTO ${VOTERS_TABLE} (nin, name, dob, email, password, state, "isAdmin", "hasVoted") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [nin, name, dob, email, hashedPassword, state, isAdmin, false]
  );
  return mapVoter(res.rows[0]);
}

async function validateVoter({ nin, dob, state }) {
  const voter = await getVoterByNIN(nin);
  if (!voter) {
    return { success: false, message: 'NIN not found in voter registry. You are not registered to vote.' };
  }
  if (voter.hasVoted) {
    return { success: false, message: 'You have already voted. Duplicate voting is not allowed.' };
  }
  if (voter.dob !== dob) {
    return { success: false, message: 'Date of birth does not match our records.' };
  }
  if (voter.state.toLowerCase() !== state.toLowerCase()) {
    return { success: false, message: 'State does not match our records.' };
  }
  return {
    success: true,
    message: 'Voter authenticated successfully',
    voter: {
      id: voter.id || voter.nin,
      nin: voter.nin,
      fullName: voter.name || 'Registered Voter',
      dob: voter.dob,
      state: voter.state,
      hasVoted: voter.hasVoted,
      isAdmin: voter.isAdmin || false,
    },
  };
}

async function markVoted(nin, receiptToken) {
  await query(
    `UPDATE ${VOTERS_TABLE} SET "hasVoted" = true, "votedAt" = NOW(), "receiptToken" = $1 WHERE nin = $2`,
    [receiptToken, nin]
  );
}

async function getCandidates(position) {
  if (position) {
    const res = await query(`SELECT * FROM ${CANDIDATES_TABLE} WHERE position = $1 ORDER BY name ASC`, [position]);
    return res.rows;
  }
  const res = await query(`SELECT * FROM ${CANDIDATES_TABLE} ORDER BY position ASC, name ASC`);
  return res.rows;
}

async function initializeCandidates(candidates) {
  const values = [];
  const params = [];
  let idx = 1;
  for (const c of candidates) {
    values.push(`($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6})`);
    params.push(c.id, c.name, c.party, c.partyShort, c.photo, c.position, c.voteCount || 0);
    idx += 7;
  }
  await query(
    `INSERT INTO ${CANDIDATES_TABLE} (id, name, party, "partyShort", photo, position, "voteCount") VALUES ${values.join(', ')} ON CONFLICT (id) DO NOTHING`,
    params
  );
}

async function incrementVoteCount(candidateId) {
  await query(`UPDATE ${CANDIDATES_TABLE} SET "voteCount" = "voteCount" + 1 WHERE id = $1`, [candidateId]);
}

async function castBallot({ voterNIN, selections }) {
  const existingVoter = await getVoterByNIN(voterNIN);
  if (!existingVoter) {
    return { success: false, message: 'Voter not found.' };
  }
  if (existingVoter.hasVoted) {
    return { success: false, message: 'You have already voted. Duplicate voting is not allowed.' };
  }

  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  const receiptToken = `RCP-${timestamp}-${randomNum}`;

  const client = await require('./pgClient').getPool().connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO ${VOTES_TABLE} (voter_nin, receipt_token, president, governor, senator, house_of_reps, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [voterNIN, receiptToken, selections.president || null, selections.governor || null, selections.senator || null, selections.houseOfReps || null, new Date(timestamp)]
    );

    for (const [position, candidateId] of Object.entries(selections)) {
      if (candidateId) {
        await client.query(`UPDATE ${CANDIDATES_TABLE} SET "voteCount" = "voteCount" + 1 WHERE id = $1`, [candidateId]);
      }
    }

    await client.query(`UPDATE ${VOTERS_TABLE} SET "hasVoted" = true, "votedAt" = NOW(), "receiptToken" = $1 WHERE nin = $2`, [receiptToken, voterNIN]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Cast ballot transaction error:', err);
    return { success: false, message: 'An error occurred while casting your vote.' };
  } finally {
    client.release();
  }

  return { success: true, message: 'Vote cast successfully!', receiptToken };
}

async function getResults() {
  const positions = ['president', 'governor', 'senator', 'houseOfReps'];
  const results = {};

  for (const pos of positions) {
    const res = await query(`SELECT id, name, party, "partyShort", photo, "voteCount" FROM ${CANDIDATES_TABLE} WHERE position = $1 ORDER BY "voteCount" DESC, name ASC`, [pos]);
    results[pos] = res.rows.map((c) => ({
      id: c.id,
      name: c.name,
      party: c.party,
      partyShort: c.partyShort,
      photo: c.photo,
      votes: c.voteCount || 0,
    }));
  }

  const votedRes = await query(`SELECT COUNT(*) AS total_voted FROM ${VOTERS_TABLE} WHERE "hasVoted" = true`);
  const registeredRes = await query(`SELECT COUNT(*) AS total_registered FROM ${VOTERS_TABLE}`);
  const totalVoted = parseInt(votedRes.rows[0]?.total_voted || '0', 10);
  const totalRegistered = parseInt(registeredRes.rows[0]?.total_registered || '0', 10);
  const turnoutPercentage = totalRegistered > 0 ? ((totalVoted / totalRegistered) * 100).toFixed(2) : 0;

  return {
    results,
    stats: { totalVoted, totalRegistered, turnoutPercentage },
  };
}

async function getVoteByReceiptToken(token) {
  const res = await query(`SELECT receipt_token AS "receiptToken", president, governor, senator, house_of_reps AS "houseOfReps", timestamp FROM ${VOTES_TABLE} WHERE receipt_token = $1`, [token]);
  return res.rows[0] || null;
}

async function createSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS ${VOTERS_TABLE} (
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

  await query(`CREATE INDEX IF NOT EXISTS idx_voters_nin ON ${VOTERS_TABLE}(nin)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_voters_email ON ${VOTERS_TABLE}(email)`);

  await query(`
    CREATE TABLE IF NOT EXISTS ${CANDIDATES_TABLE} (
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

  await query(`CREATE INDEX IF NOT EXISTS idx_candidates_position ON ${CANDIDATES_TABLE}(position)`);

  await query(`
    CREATE TABLE IF NOT EXISTS ${VOTES_TABLE} (
      id SERIAL PRIMARY KEY,
      voter_nin VARCHAR(255) NOT NULL REFERENCES ${VOTERS_TABLE}(nin),
      receipt_token VARCHAR(255) UNIQUE NOT NULL,
      president VARCHAR(255),
      governor VARCHAR(255),
      senator VARCHAR(255),
      house_of_reps VARCHAR(255),
      timestamp TIMESTAMP DEFAULT NOW(),
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_votes_receipt ON ${VOTES_TABLE}(receipt_token)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_votes_voter ON ${VOTES_TABLE}(voter_nin)`);

  try {
    await query(`ALTER TABLE ${VOTERS_TABLE} ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT FALSE`);
  } catch (e) {
    console.warn(' voters isAdmin migration warning:', e.message);
  }
  try {
    await query(`ALTER TABLE ${VOTERS_TABLE} ADD COLUMN IF NOT EXISTS "hasVoted" BOOLEAN DEFAULT FALSE`);
  } catch (e) {
    console.warn('voters hasVoted migration warning:', e.message);
  }
  try {
    await query(`ALTER TABLE ${VOTERS_TABLE} ADD COLUMN IF NOT EXISTS "votedAt" TIMESTAMP`);
  } catch (e) {
    console.warn('voters votedAt migration warning:', e.message);
  }
  try {
    await query(`ALTER TABLE ${VOTERS_TABLE} ADD COLUMN IF NOT EXISTS "receiptToken" VARCHAR(255)`);
  } catch (e) {
    console.warn('voters receiptToken migration warning:', e.message);
  }

  const countRes = await query(`SELECT COUNT(*) AS total FROM ${CANDIDATES_TABLE}`);
  const candidateCount = parseInt(countRes.rows[0]?.total || '0', 10);
  if (candidateCount === 0) {
    await initializeCandidates(DEFAULT_CANDIDATES);
    console.log(`Seeded ${DEFAULT_CANDIDATES.length} default candidates into PostgreSQL`);
  }
}

module.exports = {
  isAvailable,
  getVoterById,
  getVoterByNIN,
  getVoterByEmail,
  registerVoter,
  validateVoter,
  markVoted,
  getCandidates,
  initializeCandidates,
  incrementVoteCount,
  castBallot,
  getResults,
  getVoteByReceiptToken,
  createSchema,
};
