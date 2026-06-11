# HVAC Ops Platform

## Project Structure

This project follows the Next.js 14 App Router convention.

- `src/app/`: Contains the application routes and pages.
  - `(auth)/`: Authentication flow (Login).
  - `(main)/`: Core application experience (Dashboard, Admin, Bible).
  - `api/`: Backend API endpoints.
- `src/components/`: Reusable React components organized by feature.
- `src/lib/`: Shared utilities and infrastructure logic (Prisma, Auth, Audit).
- `prisma/`: Database schema and configuration.
- `docs/`: Product vision, roadmap, and architecture documentation.

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Generate Prisma client: `npx prisma generate`
4. Run development server: `npm run dev`

