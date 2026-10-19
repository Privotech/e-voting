# E-Voting System

A TypeScript e-voting application built with the Next.js App Router, React, and Tailwind CSS. The website and its API run in the same Next.js application; no separate Express server is needed.

## Features

- Multi-factor voter authentication (NIN, date of birth, and email)
- Tamper-evident ballot and real-time review
- Cryptographic receipt audit sandbox
- Live election results and turnout visualizations
- Admin dashboard and audit logs

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure PostgreSQL in `.env`:
   ```bash
   DATABASE_URL=postgresql://...
   JWT_SECRET=replace-with-a-long-random-secret
   ```

   `NEON_DATABASE_URL` is also supported in place of `DATABASE_URL`.
   Use a randomly generated `JWT_SECRET` of at least 32 characters. Never expose either value to client-side code.

3. Start the development app:
   ```bash
   npm run dev
   ```

4. Build and run production:
   ```bash
   npm run build
   npm run start
   ```

Open [http://localhost:3000](http://localhost:3000). API endpoints are implemented under `app/api/`; the database schema is initialized automatically when an API first connects to PostgreSQL.

## Authentication and voter provisioning

- Voter validation checks the PostgreSQL voter registry and issues a short-lived signed token. Ballot submission and voter status checks require that token.
- Public voter and administrator self-registration are disabled. Voter records and administrator accounts must be provisioned through a trusted, out-of-band process; administrator privileges are determined by the database `Voter.isAdmin` field.
- Administrator-only API operations re-check the account's current database role. Demo credentials and client-side ballot fallbacks are not accepted.
- Do not use this demo application for a binding public election without independent security review, operational controls, rate limiting, audit procedures, and end-to-end election testing.
