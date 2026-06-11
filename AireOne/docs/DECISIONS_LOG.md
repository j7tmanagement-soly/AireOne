# Decisions Log

## 2024-01 — Session 1

### Custom JWT over NextAuth
**Decision**: Roll custom JWT auth instead of NextAuth
**Reason**: Username-only login with no OAuth providers. NextAuth adds complexity with no benefit here. Simple bcrypt + jsonwebtoken gives full control.

### Radix UI over shadcn/ui CLI
**Decision**: Import Radix UI primitives directly, style manually
**Reason**: shadcn/ui CLI can be tricky in containerized environments. Direct Radix imports give same result with full control.

### Polymorphic Acknowledgements
**Decision**: Single Acknowledgements table with contentType enum + contentId
**Reason**: Policies, announcements, and articles all need acknowledgements. Polymorphic approach avoids 3 separate ack tables. Unique constraint on [userId, contentType, contentId] ensures immutability.

### No Soft Delete on Acknowledgements
**Decision**: Acknowledgements are never deleted (no deletedAt field)
**Reason**: Compliance records must be immutable. Deleting an ack would undermine the entire compliance use case.

### PostgreSQL Full-Text Search First
**Decision**: Start with PostgreSQL tsvector, not vector embeddings
**Reason**: Simpler to deploy, no extra dependencies, good enough for Phase 5. Clear upgrade path to pgvector later if semantic search is needed.

### Role[] Array for Announcement Targeting
**Decision**: Store targetRoles as a PostgreSQL array, empty = all roles
**Reason**: Announcements may target specific departments (e.g. only technicians). Array approach is simple and flexible.
