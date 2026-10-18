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

2. Configure PostgreSQL in `.env.local`:
   ```bash
   DATABASE_URL=postgresql://...
   JWT_SECRET=replace-with-a-long-random-secret
   ```

   `NEON_DATABASE_URL` is also supported in place of `DATABASE_URL`.

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
