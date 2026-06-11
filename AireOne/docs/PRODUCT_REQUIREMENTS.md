# Product Requirements

## Authentication
- Username + password login only (no OAuth)
- Admin creates user accounts
- Example usernames: Salman1234, MikeTech01, Dispatcher02
- JWT in httpOnly cookie, 24h expiry
- Role-based: ADMIN, MANAGER, TECHNICIAN, DISPATCHER, CSR, INSTALLER, COMFORT_ADVISOR, EMPLOYEE

## Company Bible (Knowledge Base)
- Categories: Sales, Service, Installation, Dispatch, Customer Service, Safety, HR, Marketing, Accounting, Management
- Unlimited articles per category
- Rich text content (markdown-based)
- Image, video, PDF attachment support
- Tags, related content, version tracking
- Read time estimation
- Sample content pre-loaded and flagged (isSample: true)

## SOP System
Structured format (not free-form):
1. Purpose
2. When To Use
3. Required Materials (list)
4. Required Tools (list)
5. Procedure Steps (ordered, with warnings/tips)
6. Common Mistakes (list)
7. Escalation Process
8. Related Policies
9. Attachments

## Policy Versioning
- Semantic versioning (1.0, 1.1, 2.0)
- Required fields per version: content, effectiveDate, changeReason
- Visual diff or side-by-side comparison (Phase 3)
- Can require acknowledgement per version

## Announcements
- 3 priority levels: NORMAL, IMPORTANT, CRITICAL
- CRITICAL auto-requires acknowledgement
- Target by role (e.g. technicians only) or all staff
- Expiry date support
- Appear on employee dashboard

## Acknowledgements & Digital Signatures
Must capture:
- Full name
- Employee ID (if set)
- Signature (typed or drawn, stored as data)
- IP address
- User agent / device info
- Timestamp
- Policy version acknowledged

Records are IMMUTABLE — never deleted.

## Dashboards

### Employee
- Pending acknowledgements (prominent, cannot dismiss without signing)
- Unread announcements
- Assigned training progress
- Recent policy changes
- Search bar
- Quick links to popular content

### Admin
- Total employees count
- Compliance % (acks completed vs pending)
- Employees with outstanding acks (list)
- Recent activity feed
- Training completion rates
- Quiz pass rates
- Most/least viewed content

## Search
Phase 5: PostgreSQL full-text search
- Searches: article titles, content, SOP titles/steps, policy content
- Natural language queries work
- Results show category, content type, excerpt
- Future: AI-powered semantic search via pgvector

## AI Assistant
- Scoped strictly to company knowledge base
- Never invents information
- Cites source document + category
- If answer not found: says "I don't have that information in our company documents"
- Conversation history within session

## Training System
- Training Tracks (e.g. "New Technician Onboarding")
- Each track has ordered modules: reading, video, quiz, acknowledgement
- Target by role (auto-assign when user role matches)
- Progress tracking (% complete)
- Cannot mark complete until all required modules done

## Quizzes
- Multiple choice
- Passing score configurable per quiz
- Unlimited attempts
- Show explanations after submission
- Track: score, pass/fail, attempt count, last attempt date
- Certification record on pass

## Read Tracking
Per content item, per user:
- First viewed timestamp
- Last viewed timestamp
- View count
- Time spent (seconds)
- Acknowledged (boolean + timestamp)
- Quiz completed (boolean + score)

## Mobile-First PWA
- Responsive down to 375px
- Bottom navigation on mobile
- Installable (manifest.json)
- Offline: cache recently viewed articles
- Service worker: cache-first for content, network-first for API

## Compliance Reports (Phase 9)
- Filter by: date range, role, department, content item
- Export CSV: employee, content, version, signature, timestamp
- Show: who has/hasn't acknowledged each policy
- Printable acknowledgement records

## Notifications
Types:
- NEW_ANNOUNCEMENT — new announcement published
- POLICY_UPDATE — policy you may have read has been updated
- ACK_REQUIRED — action required: sign this
- TRAINING_ASSIGNED — new training track assigned to you
- QUIZ_RESULT — your quiz score
- SYSTEM — admin messages

Delivery: in-app only (Phase 1). Email (future phase).

## Audit Log
Every write action logged with:
- Who did it
- What entity was affected
- Old and new values
- IP address
- Timestamp
