# WayHome — Rules

## 1. Before Coding

1. Read PRD.md.
2. Read Architecture.md.
3. Read Design.md.
4. Read Task.md.
5. Inspect the existing implementation before creating new files.
6. Identify reusable services/components before duplicating functionality.
7. Write a short implementation plan for non-trivial work.

## 2. Scope Control

- Do not change unrelated files.
- Do not rewrite working features merely for style.
- Do not perform broad refactors during a focused feature task.
- Do not delete existing functionality without explicit approval.
- Do not rename core entities/routes without checking all consumers.

## 3. Security

- Never expose passwords, secrets, JWT signing keys, or database credentials.
- Never trust client-provided role information.
- Never trust client-provided ownership information when JWT identity can determine it.
- Derive authenticated identity from the server-side security context.
- Validate authorization on every protected write.
- Protect both frontend routes and backend APIs.
- Never rely on hiding a button as authorization.
- Test direct API access as well as normal UI access.
- Prevent cross-user resource access.

## 4. Role Separation

### ADMIN
Can access administrator workflows.

### PROPERTY_MANAGER
Can manage authorized property-manager workflows and owned resources.

### TENANT
Must not receive student-only navigation or property-listing-manager controls.

### STUDENT
Must receive student-housing functionality and must not receive normal property-listing-manager controls unless explicitly authorized.

Student and Tenant are different roles.

## 5. Data Integrity

- Validate required fields.
- Validate duplicate constraints.
- Prevent duplicate active rental applications where the business rule requires it.
- Validate resource ownership.
- Validate state transitions.
- Do not allow impossible agreement/application states.
- Persist state changes correctly.
- Do not silently discard database errors.

## 6. Listing Forms

- Use property-type-specific fields.
- Do not force PG/Hostel fields onto normal flats/villas.
- Do not force normal property-manager fields onto student accommodation.
- Keep structured fields searchable.
- Allow legitimate optional custom fields where the product requires them.
- Sanitize/validate custom field values.

## 7. Reviews

- Do not create fake reviews and present them as genuine user reviews.
- If demo reviews are required, label them clearly as sample/demo content or use a seeded demo dataset.

## 8. API Design

- Keep business logic in services.
- Controllers should remain thin.
- Reuse existing API patterns.
- Return appropriate HTTP status codes.
- Do not create duplicate endpoints when an existing endpoint can be extended safely.
- Keep DTO boundaries where sensitive fields should not be exposed.

## 9. Frontend

- Reuse existing components.
- Respect Design.md tokens.
- Provide loading, empty, success and error states for data screens.
- Do not expose unauthorized actions.
- Do not rely on frontend checks for security.
- Avoid breaking responsive layouts.
- Do not introduce a new visual system for one screen.

## 10. Database

- Never delete/rename production data fields casually.
- Use migration planning for schema changes.
- Preserve foreign-key relationships.
- Verify persistence after restart for important features.
- Do not hard-code database records in frontend code as a replacement for backend persistence.

## 11. Testing

Before marking work complete:
- Compile backend.
- Run relevant backend tests.
- Build frontend.
- Run relevant frontend checks.
- Test authenticated and unauthenticated access.
- Test all relevant roles.
- Test ownership isolation.
- Test persistence.
- Test error paths.

Never hard-code a "100% passed" message.

Test counts must be calculated from actual executed tests.

## 12. Documentation

After completion:
- Update Task.md.
- Update Architecture.md for durable architecture changes.
- Update Design.md for durable UI-system changes.
- Keep documentation factual.
- Never document a feature as complete when it has not been verified.

## 13. Conflict Handling

If requirements conflict:
1. Stop.
2. Identify the conflict.
3. Explain the affected files/behavior.
4. Ask for a decision when necessary.

Do not guess silently.
