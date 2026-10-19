CREATE TABLE "voters" (
    "id" SERIAL NOT NULL,
    "nin" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "dob" VARCHAR(255) NOT NULL,
    "state" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "hasVoted" BOOLEAN NOT NULL DEFAULT false,
    "votedAt" TIMESTAMP(6),
    "receiptToken" VARCHAR(255),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "candidates" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "party" VARCHAR(255) NOT NULL,
    "partyShort" VARCHAR(255) NOT NULL,
    "photo" TEXT NOT NULL,
    "position" VARCHAR(255) NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "votes" (
    "id" SERIAL NOT NULL,
    "voter_nin" VARCHAR(255) NOT NULL,
    "receipt_token" VARCHAR(255) NOT NULL,
    "president" VARCHAR(255),
    "governor" VARCHAR(255),
    "senator" VARCHAR(255),
    "house_of_reps" VARCHAR(255),
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "voters_nin_key" ON "voters"("nin");
CREATE UNIQUE INDEX "voters_email_key" ON "voters"("email");
CREATE INDEX "candidates_position_idx" ON "candidates"("position");
CREATE UNIQUE INDEX "votes_receipt_token_key" ON "votes"("receipt_token");
CREATE INDEX "votes_voter_nin_idx" ON "votes"("voter_nin");

ALTER TABLE "votes"
ADD CONSTRAINT "votes_voter_nin_fkey"
FOREIGN KEY ("voter_nin") REFERENCES "voters"("nin")
ON DELETE RESTRICT ON UPDATE CASCADE;
