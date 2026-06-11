# Changelog

## \[0.1.0] — Session 1

### Added

* Complete Prisma schema covering all entities:

  * Users (with roles: ADMIN, MANAGER, TECHNICIAN, DISPATCHER, CSR, INSTALLER, COMFORT\_ADVISOR, EMPLOYEE)
  * Categories (10 HVAC departments)
  * Articles, SOPs, Policies (with PolicyVersions)
  * Announcements (NORMAL/IMPORTANT/CRITICAL)
  * Acknowledgements with digital signature fields
  * ReadRecords (engagement tracking)
  * TrainingTracks + TrainingModules + TrainingProgress
  * Quizzes + QuizQuestions + QuizAttempts
  * Attachments + Media
  * Notifications
  * AuditLog
* Full project documentation:

  * MASTER\_VISION.md
  * ARCHITECTURE.md
  * ROADMAP.md
  * FEATURE\_STATUS.md
  * DECISIONS\_LOG.md
  * DATABASE\_SCHEMA.md
  * SESSION\_HANDOFF.md
  * CHANGELOG.md
  * PRODUCT\_REQUIREMENTS.md
* Next.js 14 project scaffolding (in progress)

cat > /home/claude/AireOne/AireOne/docs/CHANGELOG.md << 'EOF'

* \# Changelog
* 
* \## \[0.2.0] — Session 2
* 
* \### Added — Company Bible Full Flow (Phase 2)
* 
* \*\*API Routes\*\*
* \- `GET /api/articles` — list articles with filters (categoryId, status, type, search, take, skip)
* \- `POST /api/articles` — create article with auto slug generation and audit log
* \- `GET /api/articles/\\\[id]` — fetch article, increment view count, upsert read record
* \- `PATCH /api/articles/\\\[id]` — update article fields, auto-set publishedAt on publish
* \- `DELETE /api/articles/\\\[id]` — soft archive (sets status → ARCHIVED)
* \- `GET /api/acknowledgements` — check if user has acked content
* \- `POST /api/acknowledgements` — submit digital signature ack (validates name, records IP/UA)
* 
* \*\*Pages\*\*
* \- `/bible/category/\\\[slug]` — category page with articles grouped by type (Article/SOP/Policy/Incident Guide), draft indicator for admins, empty state with create prompt
* \- `/bible/\\\[slug]` — article reader with read tracking, breadcrumb, related articles sidebar, admin edit/archive actions, acknowledgement block
* \- `/bible/\\\[slug]/edit` — edit page for admins, pre-populates editor with existing data
* \- `/bible/new` — new article page, supports `?category=id` pre-selection
* 
* \*\*Components\*\*
* \- `components/content/ArticleViewer.tsx` — renders markdown-like content: # headings, \*\*bold\*\*, \*italic\*, `code`, - lists, 1. ordered, > quotes, ⚠️ warnings, 💡 tips, --- dividers, \[links](url); shows metadata bar with author/date/views
* \- `components/forms/ArticleEditor.tsx` — full article creation/edit form with live preview tab, formatting reference panel, status selector, requiresAck toggle
* \- `components/content/AckForm.tsx` — digital signature by typed name matching, validates against account name, records to DB on submit
* \- `components/content/AdminArticleActions.tsx` — edit link + two-step confirm archive button for admin sidebar
* 
* \---
* 
* \## \[0.1.0] — Session 1
* 
* \### Added
* \- Complete Prisma schema covering all entities (Users, Categories, Articles, SOPs, Policies, PolicyVersions, Announcements, Acknowledgements, ReadRecords, TrainingTracks, TrainingModules, TrainingProgress, Quizzes, QuizQuestions, QuizAttempts, Attachments, Notifications, AuditLog)
* \- Full project documentation (MASTER\_VISION, ARCHITECTURE, ROADMAP, FEATURE\_STATUS, DECISIONS\_LOG, PRODUCT\_REQUIREMENTS, CHANGELOG)
* \- Next.js 14 App Router project with TypeScript + Tailwind
* \- Auth system: login, JWT, httpOnly cookie, middleware, permissions
* \- App shell: Sidebar (desktop), Topbar, MobileNav (mobile)
* \- User management: admin CRUD for users
* \- Employee dashboard with pending acks, announcements, recent articles
* \- Admin dashboard with stats, quick actions, recent activity feed
* \- Company Bible main page (`/bible`) — category grid + recently updated articles
* EOF
* echo "CHANGELOG.md updated"

