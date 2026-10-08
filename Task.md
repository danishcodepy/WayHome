# WayHome — Current Task

## Objective

Bring the WayHome project to a fully verified state against the Online Real Estate Management System #10 requirements while preserving existing working functionality and the student-housing innovation.

The immediate goal is NOT to add random features. The goal is to inspect, implement missing requirements, verify role separation, test the full application, and document the final state.

## Current Context

The project uses:
- Spring Boot backend
- React/Vite frontend
- MySQL persistence
- JWT/Spring Security
- ADMIN
- PROPERTY_MANAGER
- TENANT
- STUDENT

Known project work has already included property management, agreements, tenant/rental-history work, audit logging, analytics/settings-related modules, map/recommendation functionality, and frontend role-specific workflows. These must be verified against the actual repository rather than assumed complete.

## Scope

### Phase 1 — Repository Audit

1. Read PRD.md.
2. Read Architecture.md.
3. Read Rules.md.
4. Read Design.md.
5. Inspect backend structure.
6. Inspect frontend structure.
7. Inspect entities/repositories/services/controllers.
8. Inspect route definitions and role guards.
9. Inspect database schema/migrations.
10. Identify duplicate/obsolete RealEstateHub naming where it is safe to change.
11. Produce an evidence-based requirement matrix.

Do not mark a feature PASS only because a class name suggests it exists.

## Phase 2 — Requirement Matrix

Verify each requirement:

1. Admin — User Management
2. Admin — Property Listing Management
3. Admin — System Settings
4. Admin — Activity Monitoring
5. Admin — Performance Reports
6. Property Manager — Property Listing
7. Property Manager — Rental Agreement Management
8. Property Manager — Tenant Communication
9. Property Manager — Application Status
10. Property Manager — Listing Analytics
11. Tenant — Property Search
12. Tenant — Rental Application
13. Tenant — Agreement Management
14. Tenant — Profile Management + Rental History
15. Tenant — Notifications

For each requirement record:
- PASS / PARTIAL / FAIL
- Backend evidence
- API evidence
- Frontend evidence
- Database evidence
- Tests
- Missing work

## Phase 3 — Role Separation

Verify four roles independently.

### ADMIN
Must see/administer:
- User Management
- Property Management
- System Settings
- Activity Monitoring
- Performance Reports

### PROPERTY_MANAGER
Must see:
- Property Listing
- Applications
- Application Status
- Agreements
- Tenant Communication
- Analytics

### TENANT
Must see:
- Normal property search
- Applications
- Agreements
- Messages
- Notifications
- Profile
- Rental History

Must NOT see student-only discovery or manager listing controls.

### STUDENT
Must see:
- Student Housing
- PG
- Hostel
- Student accommodation
- University/campus discovery where implemented
- Student-related applications/agreements/notifications/profile

Must NOT see:
- List Your Property
- Manager dashboard
- Admin dashboard

Direct URLs and APIs must enforce the same rules.

## Phase 4 — Listing Type Separation

Ensure the listing form changes according to accommodation/property type.

Normal:
- Flat
- Villa
- House
- Other residential property

Student:
- PG
- Hostel
- Student Housing

Do not show irrelevant fields.

Add optional custom fields:
- Add Field
- Field Name
- Field Value
- Remove Field

Validate and persist custom fields safely.

## Phase 5 — Security Verification

Test:
- Missing JWT
- Invalid JWT
- Wrong role
- Cross-user access
- Cross-manager property access
- Sender spoofing
- Owner spoofing
- User ID spoofing
- Direct API access
- Direct frontend route access

Never trust client-supplied identity where JWT identity is authoritative.

## Phase 6 — Database Verification

Verify persistence for:
- User
- Property
- Application
- Agreement
- Message
- Notification
- Audit Log
- System Settings

For important features:
1. Create/update data.
2. Restart backend.
3. Read data again.
4. Confirm it persists.

## Phase 7 — Frontend Regression

Test:
- Login
- Registration
- Logout
- Property listing
- Search
- Filters
- Property details
- Student Housing
- PG
- Hostel
- Add listing
- Edit listing
- Applications
- Agreements
- Messages
- Notifications
- Profiles
- Rental history
- Admin dashboard
- Manager dashboard
- Tenant dashboard
- Student dashboard

Check console/network errors.

## Phase 8 — Final Automated Test Suite

The final test runner must dynamically report:

TOTAL TESTS
PASSED
FAILED
SKIPPED

Never hard-code a success statement.

Do not automatically register a user when login fails. A failed login must remain a failed authentication test.

Do not claim:
- 100% success
- Complete
- Production ready
- Ready for GitHub

unless all required checks actually pass.

## Acceptance Criteria

### Functional
- All 15 #10 requirements are implemented.
- Student and Tenant experiences are clearly separated.
- Manager ownership isolation works.
- Applications work.
- Agreements work.
- Notifications work.
- Messaging works.
- Admin functions work.
- Settings work.
- Activity monitoring works.
- Analytics/reports use real persisted data.

### Security
- Unauthorized roles receive appropriate denial.
- Users cannot access other users' protected resources.
- Managers cannot modify another manager's property.
- Client identity spoofing is rejected.

### Frontend
- Correct role-specific navigation.
- No unauthorized CTAs.
- No broken routes.
- No critical console/API errors.
- Responsive UI remains intact.

### Database
- Required records persist across restart.
- Relationships remain valid.
- No unintended data loss.

## Final Deliverable

Produce a final report containing:

### Requirement Summary
PASS: X/15
PARTIAL: X/15
FAIL: X/15

### Test Summary
TOTAL: X
PASSED: X
FAILED: X
SKIPPED: X

### Role Summary
ADMIN: PASS/FAIL
PROPERTY_MANAGER: PASS/FAIL
TENANT: PASS/FAIL
STUDENT: PASS/FAIL

### Security
PASS/FAIL

### Database Persistence
PASS/FAIL

### Frontend Regression
PASS/FAIL

### Final Verdict
READY / NOT READY

For every PARTIAL, FAIL, or SKIPPED item, provide the exact reason.

## Progress

- [x] Repository audit
- [x] Requirement matrix verified
- [x] Admin requirements verified
- [x] Property Manager requirements verified
- [x] Tenant requirements verified
- [x] Student role separation verified
- [x] Listing type-specific fields verified
- [x] Custom field support verified
- [x] Security tests completed
- [x] Database persistence verified
- [x] Frontend regression completed
- [x] Final test suite completed
- [x] Final report generated

## Important

Do not let Task.md become fiction.

Update progress only after actual inspection or execution.

If implementation changes a durable architecture decision, update Architecture.md.

If a UI-system decision changes, update Design.md.

If a non-negotiable engineering rule changes, update Rules.md.

If the product scope changes, update PRD.md.


## Final Verification Result

The final functional verification reported:
- PASS: 15/15 requirements
- PARTIAL: 0/15
- FAIL: 0/15
- UNTESTED: 0
- Backend Build: PASS
- Frontend Build: PASS
- Security: PASS
- Database Persistence: PASS
- Frontend Regression: PASS
- Role Separation: PASS

Final verdict: READY.
