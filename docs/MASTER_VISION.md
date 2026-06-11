# HVAC Operations OS — Master Vision

## What This Is

A complete operational platform that serves as the single source of truth for a residential HVAC company. This is NOT a simple knowledge base or wiki — it is the company's entire operational brain.

## The Problem It Solves

HVAC companies currently operate on **tribal knowledge**:
- Pricing rules, sales procedures, warranty procedures — all communicated verbally
- New employees are inconsistently trained
- Employees claim "I was never told" — with no way to disprove it
- Policy updates are not tracked or proven
- Management cannot prove who read what

## The Solution

A platform that functions simultaneously as:
- **Operations Manual** — how we do everything
- **Company Bible** — our rules, values, culture
- **Policy Library** — versioned, immutable records
- **SOP Repository** — step-by-step procedures
- **Training System** — onboarding tracks with quizzes
- **Compliance System** — digital signatures, audit trails
- **Announcement Platform** — company communications
- **AI Assistant** — answers questions from company knowledge only

## Target Users

### Administrators (Owners, Managers, Trainers)
- Create and manage all content
- Track compliance and acknowledgements
- View analytics and reports
- Manage users

### Employees (Technicians, Dispatchers, CSRs, Installers)
- Access knowledge on mobile devices in the field
- Complete training tracks
- Acknowledge policies
- Search for answers instantly

## Design Philosophy

- **Mobile-first** — most users are field technicians on phones
- **Simple auth** — username + password only, no OAuth complexity
- **Offline-capable** — PWA with service worker caching
- **Feels complete on day one** — extensive sample HVAC content pre-loaded
- **Proves compliance** — digital signatures with IP/device/timestamp

## Tech Stack

- **Framework**: Next.js 14 App Router + TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **Auth**: Custom JWT (no NextAuth — too complex for username-only flow)
- **AI**: Anthropic Claude API (scoped to company content only)
- **Search**: PostgreSQL full-text search (Phase 5), upgrade to pgvector later

## Success Criteria

1. Admin can create a user, assign a training track, and the employee can complete it on mobile
2. Admin can publish a policy update and see 100% acknowledgement with timestamps
3. Employee can ask "What is our capacitor policy?" and get a cited answer
4. Admin can export a compliance report proving who signed what, when
