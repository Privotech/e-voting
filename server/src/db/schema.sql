-- PostgreSQL Schema for E-Voting Application
-- Run this against your Neon PostgreSQL database

BEGIN;

-- Voters table
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
);

CREATE INDEX IF NOT EXISTS idx_voters_nin ON voters(nin);
CREATE INDEX IF NOT EXISTS idx_voters_email ON voters(email);

-- Candidates table
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
);

CREATE INDEX IF NOT EXISTS idx_candidates_position ON candidates(position);

-- Votes table
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
);

CREATE INDEX IF NOT EXISTS idx_votes_receipt ON votes(receipt_token);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_nin);

COMMIT;
