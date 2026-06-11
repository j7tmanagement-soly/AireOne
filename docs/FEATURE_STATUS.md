# Feature Status

Last updated: Session 1

## ✅ Complete

* Prisma schema (full database design)
* Project documentation structure
* Architecture decisions

## 🔄 In Progress (Session 1)

* Next.js project setup
* Tailwind/TypeScript config
* Auth system (login, JWT, middleware)
* App shell (sidebar, nav)
* User management

## ⏳ Not Started

* Company Bible (articles, categories)
* SOP system
* Policy versioning
* Announcements
* Acknowledgements + digital signatures
* Dashboards
* Search
* AI assistant
* Training tracks
* Quizzes
* Sample content seeder
* PWA (manifest, service worker)
* Reports

## Known Issues

* None yet (project just started)

bash
* 
* cat > /home/claude/AireOne/AireOne/docs/FEATURE\_STATUS.md << 'EOF'
* \# Feature Status
* 
* Last updated: Session 2
* 
* \## ✅ Complete
* 
* \### Phase 1 — Foundation \& Auth
* \- Prisma schema (full database design — all 20+ models)
* \- Project documentation structure (8 docs)
* \- Auth system: `lib/auth.ts` (JWT, bcrypt, cookie, permissions)
* \- Login/logout API routes (`/api/auth/login`, `/api/auth/logout`, `/api/auth/session`)
* \- Next.js middleware for route protection (`src/app/middleware.ts`)
* \- App shell: Sidebar, Topbar, MobileNav components
* \- User management: UserManagementClient, `/admin/users/page.tsx`, `/api/users/\[id]/route.ts`
* \- Employee dashboard (`/dashboard`)
* \- Admin dashboard (`/admin`)
* 
* \### Phase 2 — Company Bible (COMPLETED THIS SESSION)
* \- Article list API: `GET /api/articles` (filtered by category, type, status, search)
* \- Article create API: `POST /api/articles` (slug generation, audit log)
* \- Article detail API: `GET /api/articles/\[id]` (view tracking, read records)
* \- Article update API: `PATCH /api/articles/\[id]`
* \- Article archive API: `DELETE /api/articles/\[id]` (soft delete → ARCHIVED)
* \- Acknowledgements API: `POST /api/acknowledgements`, `GET /api/acknowledgements`
* \- Company Bible main page: `/bible` (category grid + recent articles) ← from Session 1
* \- Category page: `/bible/category/\[slug]` (articles grouped by type, draft indicators)
* \- Article reader page: `/bible/\[slug]` (view tracking, sibling nav, ack block)
* \- Article edit page: `/bible/\[slug]/edit`
* \- New article page: `/bible/new`
* \- `ArticleViewer` component (markdown-like renderer with bold/italic/code/lists/callouts)
* \- `ArticleEditor` component (full form with live preview, status, tags, ack toggle)
* \- `AckForm` client component (typed-name digital signature)
* \- `AdminArticleActions` component (edit/archive buttons)
* 
* \## 🔄 Next Up (Session 3) — Phase 3: Policies \& Announcements
* 
* \### Policies
* \- `GET/POST /api/policies` — list + create policy with first version
* \- `GET/PATCH /api/policies/\[id]` — get + update policy
* \- `POST /api/policies/\[id]/versions` — publish new version
* \- `/policies` — policy list page
* \- `/policies/\[slug]` — policy reader with version history sidebar
* \- `PolicyViewer` component
* \- Policy version ack flow (reuse AckForm)
* 
* \### Announcements
* \- `GET/POST /api/announcements` — list + create
* \- `PATCH /api/announcements/\[id]` — update/expire
* \- `/announcements` — announcement list with NORMAL/IMPORTANT/CRITICAL tabs
* \- `/announcements/\[id]` — announcement detail with ack form
* \- `AnnouncementViewer` component
* 
* \## ⏳ Not Started (Future Sessions)
* \- SOPs (`/sops`, `/api/sops`) — Phase 2b
* \- Admin category management (`/admin/categories`) — allows creating/editing categories
* \- Search (`/search`, `/api/search`) — Phase 5
* \- AI assistant (`/ai-assistant`, `/api/ai`) — Phase 5
* \- Training tracks + quizzes — Phase 6
* \- Sample HVAC content seeder — Phase 7
* \- PWA (manifest, service worker) — Phase 8
* \- Admin reports/compliance export — Phase 9
* \- Notification bell (unread count + dropdown) — Phase 4
* 
* \## Known Issues / Notes
* \- `ArticleViewer` is passed `article` with `Date` types — when serialized from RSC, dates become strings; the `formatDate()` call handles both via `new Date(date)`
* \- Edit button in `ArticleViewer` has `onEdit` prop but the article page uses direct Link to `/bible/\[slug]/edit` instead — the `onEdit` prop can be removed or repurposed later
* \- Topbar has hardcoded notification bell dot — wire to real notification count in Phase 4
* EOF
* echo "FEATURE\_STATUS.md updated"

