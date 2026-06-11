# Architecture

## Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 14 App Router | SSR, API routes, file-based routing |
| Language | TypeScript | Type safety across full stack |
| Database | PostgreSQL | Relational, full-text search, audit-friendly |
| ORM | Prisma | Type-safe queries, migrations |
| Styling | Tailwind CSS v3 | Utility-first, mobile-first |
| Components | Radix UI (headless) | Accessible, unstyled primitives |
| Auth | Custom JWT | Username-only login, no OAuth needed |
| AI | Anthropic API | Company-scoped Q&A assistant |

## Directory Structure

```
/src
  /app
    /api              — Next.js API routes
      /auth           — login, logout, me
      /users          — CRUD users (admin only)
      /articles       — CRUD articles
      /policies       — CRUD policies + versions
      /sops           — CRUD SOPs
      /announcements  — CRUD announcements
      /acknowledgements — sign + list
      /training       — tracks, progress
      /quizzes        — CRUD quizzes + attempts
      /search         — full-text search
      /ai             — AI assistant endpoint
      /notifications  — list + mark read
      /admin          — analytics, reports
    /(auth)           — login page (no nav)
    /(app)            — authenticated shell with sidebar
      /dashboard      — employee dashboard
      /admin          — admin dashboard
      /bible          — company bible / articles
      /policies       — versioned policies
      /sops           — SOPs
      /announcements  — announcements
      /training       — training tracks
      /quizzes        — quizzes
      /search         — search page
      /ai-assistant   — AI chat
      /admin/users    — user management
      /admin/reports  — compliance reports
  /components
    /ui               — base Radix/Tailwind components
    /layout           — shell, sidebar, topbar, mobile nav
    /content          — article viewer, SOP viewer, policy viewer
    /forms            — content editors, user forms
    /dashboard        — dashboard widgets
    /training         — training track UI
    /ai               — chat interface
  /lib
    /prisma.ts        — Prisma client singleton
    /auth.ts          — JWT helpers, middleware
    /permissions.ts   — role-based access checks
    /search.ts        — search helpers
    /ai.ts            — AI assistant logic
    /audit.ts         — audit log helpers
  /types
    /index.ts         — shared TypeScript types
/prisma
  /schema.prisma      — full DB schema
  /seed.ts            — sample HVAC content seeder
/project-docs         — this directory (project memory)
/public
  /manifest.json      — PWA manifest
  /sw.js              — service worker
```

## Auth Architecture

- **Login**: POST /api/auth/login → validates username+password → returns JWT in httpOnly cookie
- **Middleware**: Next.js middleware reads cookie on every request, attaches user to headers
- **Permissions**: Role-based via `lib/permissions.ts` — checked in API routes and RSC
- **No sessions table** — stateless JWT, 24h expiry (configurable)

## Permission Model

```
ADMIN     → everything
MANAGER   → everything except user deletion
TECHNICIAN → read content, complete training, ack policies
DISPATCHER → read content, complete training, ack policies
CSR        → read content, complete training, ack policies
INSTALLER  → read content, complete training, ack policies
COMFORT_ADVISOR → read content, complete training, ack policies
EMPLOYEE   → read content, complete training, ack policies
```

Content creation is gated to ADMIN + MANAGER.

## AI Assistant Architecture

1. Employee asks a question in natural language
2. POST /api/ai with `{question, conversationHistory}`
3. Server runs PostgreSQL full-text search across articles, policies, SOPs
4. Top 5 results fetched (title + content excerpt)
5. Sent to Claude API as context with strict system prompt:
   - "Only answer from the provided company documents"
   - "Cite the source document title and category"
   - "If information is not in the documents, say so clearly"
6. Response streamed back to UI

## Audit Logging

Every write operation logs to `audit_logs`:
- User ID
- Action (CREATE, UPDATE, DELETE, PUBLISH, ACKNOWLEDGE)
- Entity type + ID
- Old and new data (JSON)
- IP address + user agent
- Timestamp

## Acknowledgement Immutability

Acknowledgement records are **never deleted or updated** once created.
The unique constraint `[userId, contentType, contentId]` prevents duplicates.
This creates an immutable compliance trail.

## Search Architecture (Phase 5)

Phase 5: PostgreSQL `tsvector` full-text search across:
- `articles.title` + `articles.content`
- `sops.title` + `sops.purpose` + `sops.steps`
- `policies.title` (via version content)

Future upgrade path: pgvector embeddings for semantic search.

## PWA / Offline

- `manifest.json` in `/public`
- Service worker in `/public/sw.js` 
- Cache-first strategy for article content
- Network-first for API calls
- Installable on iOS/Android home screen
