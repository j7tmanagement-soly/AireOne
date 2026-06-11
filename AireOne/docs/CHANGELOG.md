# Changelog

## [0.1.0] — Session 1

### Added
- Complete Prisma schema covering all entities:
  - Users (with roles: ADMIN, MANAGER, TECHNICIAN, DISPATCHER, CSR, INSTALLER, COMFORT_ADVISOR, EMPLOYEE)
  - Categories (10 HVAC departments)
  - Articles, SOPs, Policies (with PolicyVersions)
  - Announcements (NORMAL/IMPORTANT/CRITICAL)
  - Acknowledgements with digital signature fields
  - ReadRecords (engagement tracking)
  - TrainingTracks + TrainingModules + TrainingProgress
  - Quizzes + QuizQuestions + QuizAttempts
  - Attachments + Media
  - Notifications
  - AuditLog
- Full project documentation:
  - MASTER_VISION.md
  - ARCHITECTURE.md
  - ROADMAP.md
  - FEATURE_STATUS.md
  - DECISIONS_LOG.md
  - DATABASE_SCHEMA.md
  - SESSION_HANDOFF.md
  - CHANGELOG.md
  - PRODUCT_REQUIREMENTS.md
- Next.js 14 project scaffolding (in progress)
