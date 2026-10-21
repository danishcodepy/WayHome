# WayHome — Design System

## 1. Design Direction

WayHome should feel like a modern, practical real-estate marketplace rather than an artificial luxury landing page.

Target qualities:
- Clean
- Bright
- Practical
- Premium but not over-designed
- Information-rich where users are evaluating properties
- Easy scan 
- Mobile-friendly

The existing approved WayHome visual language should be preserved when making incremental changes.

## 2. Brand

Primary product name:
**WayHome**

Do not introduce or display the old internal product name "RealEstateHub" as a visible brand name.

Internal Java/package names should only be renamed when explicitly required and after checking dependencies; do not perform blind global replacements.

## 3. Layout

- Use a consistent page container.
- Keep property cards aligned.
- Use consistent spacing.
- Avoid unnecessary decorative sections.
- Primary actions should remain easy to find.
- Property information should be visually prioritized.

## 4. Typography

Use the existing project typography where already established.

Hierarchy:
- Large page title
- Clear section heading
- Readable property title
- Supporting metadata
- Small secondary information

Do not introduce unrelated fonts on individual screens.

## 5. Colors

Preserve the existing WayHome color system already implemented in the repository.

When adding new components:
- Reuse existing theme tokens/classes.
- Do not invent a new palette for a single page.
- Maintain sufficient text/background contrast.

## 6. Components

Prefer existing:
- Buttons
- Inputs
- Cards
- Modals
- Navigation
- Badges
- Form controls
- Alerts
- Loading states

Do not create near-duplicate components.

## 7. Property Cards

Property cards should prioritize:
1. Image
2. Property/accommodation title
3. Location
4. Price
5. Important type-specific metadata
6. Key amenities
7. Relevant CTA

Do not overload cards with every field.

## 8. Property Details

The detail page can expose complete information.

For normal residential properties:
- type
- location
- price
- furnishing
- bedrooms/bathrooms
- area
- amenities
- photos
- owner/manager information where permitted

For PG/Hostel/Student Housing:
- sharing type
- furnishing
- beds/room details
- bathroom
- kitchen
- food availability
- Wi-Fi
- cooling
- security
- campus
- distance
- rent/deposit
- facilities
- photos
- reviews/demo-review labeling where applicable

## 9. Listing Form UX

The listing form should be type-aware.

Example:

### Flat
Show relevant residential fields.

### Villa
Show relevant residential fields.

### PG
Show PG-specific fields.

### Hostel
Show hostel-specific fields.

### Student Housing
Show student-specific fields.

Also provide an optional:
**+ Add Custom Field**

The custom field UI should allow:
- Field name
- Field value
- Remove field

Example:
Food → Available

Required structured fields must not disappear merely because custom fields exist.

## 10. Role-Specific Navigation

### Admin Navigation
- Dashboard
- Users
- Properties
- Approvals
- Activity
- Reports
- Settings
- Profile

### Property Manager Navigation
- Dashboard
- My Listings
- Add Listing
- Applications
- Agreements
- Messages
- Analytics
- Profile

### Tenant Navigation
- Properties
- Search
- Applications
- Agreements
- Messages
- Notifications
- Rental History
- Profile

Do not show:
- Student Housing
- University/Hostel/PG-specific navigation
unless the product explicitly allows it for Tenant.

### Student Navigation
- Student Housing
- Universities/Campus discovery where implemented
- PG
- Hostel
- Student Accommodation
- Applications
- Agreements
- Messages
- Notifications
- Profile

Do not show:
- List Your Property
- Manager dashboard
- Admin dashboard

unless explicitly authorized.

## 11. Role-Specific CTAs

The global "List Your Property" CTA must be role-aware.

- Admin: show where useful.
- Property Manager: show.
- Tenant: hide unless future requirements explicitly permit it.
- Student: hide unless future requirements explicitly permit it.

## 12. States

Every data-driven screen must have:
- Loading
- Empty
- Success
- Error

Forms must show:
- Validation errors
- Submission progress
- Success confirmation
- API failure feedback

## 13. Accessibility

- Keyboard-accessible controls.
- Visible focus states.
- Semantic labels.
- Sufficient contrast.
- Clear error messages.
- Do not rely only on color to communicate state.

## 14. Responsive Behavior

The UI must work across:
- Desktop
- Tablet
- Mobile

Property cards, filters, navigation, forms, dashboards, tables, and modals must not overflow or become unusable on smaller screens.
