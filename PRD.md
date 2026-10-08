# WayHome — Product Requirements Document

## 1. Product

WayHome is an Online Real Estate Management System for discovering, listing, applying for, and managing residential and student accommodation through role-based workflows.

The core academic/project objective is the Online Real Estate Management System requirement set (#10). Student Housing, PG, Hostel, university-oriented discovery, and other student-specific capabilities are product innovations and must not break the core real-estate workflows.

## 2. Target Users

### Admin
Manages users, property listings, system configuration, activity monitoring, and performance reporting.

### Property Manager
Lists and manages owned properties, handles rental applications and agreements, communicates with tenants, and views listing performance.

### Tenant
Searches normal residential properties such as flats, villas, houses, and similar rentals; applies for properties; manages agreements; maintains a profile and rental history; receives notifications.

### Student
Uses student-specific accommodation discovery such as PGs, hostels, university-oriented housing, and student accommodation. Student users must not receive normal property-owner/listing-management controls unless explicitly authorized by a future requirement.

## 3. Primary Pain Point

Users need one system where the correct accommodation type and management tools are shown according to their role, while sensitive actions remain protected by backend authorization.

## 4. Core User Journeys

### Admin Journey
1. Admin logs in.
2. Admin sees the administrative dashboard.
3. Admin manages users.
4. Admin reviews property listings.
5. Admin approves/rejects listings where applicable.
6. Admin manages system settings.
7. Admin monitors activity/audit logs.
8. Admin reviews database-driven performance reports.

### Property Manager Journey
1. Manager logs in.
2. Manager sees manager-specific dashboard/navigation.
3. Manager creates a property listing.
4. Manager edits and manages only authorized listings.
5. Manager reviews rental applications.
6. Manager updates application status.
7. Manager creates/manages rental agreements.
8. Manager communicates with tenants.
9. Manager views listing analytics.

### Tenant Journey
1. Tenant logs in.
2. Tenant sees normal residential-property discovery.
3. Tenant searches/filters properties.
4. Tenant opens property details.
5. Tenant submits a rental application.
6. Tenant tracks application status.
7. Tenant views/manages agreements.
8. Tenant manages profile and rental history.
9. Tenant receives and manages notifications.

### Student Journey
1. Student logs in.
2. Student sees Student Housing/student-specific discovery.
3. Student can browse PG, hostel, and student accommodation information.
4. Student can view detailed accommodation information.
5. Student sees student-specific actions.
6. Student does not see "List Your Property" unless a future requirement explicitly grants that capability.

## 5. Must-Have Requirements — Project #10

### Admin
- User Management
- Property Listing Management
- System Settings
- Activity Monitoring
- Performance Reports

### Property Manager
- Property Listing
- Rental Agreement Management
- Tenant Communication
- Application Status
- Listing Analytics

### Tenant
- Property Search
- Rental Application
- Agreement Management
- Profile Management + Rental History
- Notifications

## 6. Student Innovation

Student Housing is an additional product feature.

Student-specific accommodation may contain fields such as:
- PG/Hostel type
- Single/double/triple sharing
- Furnishing
- Bed information
- Bathroom
- Kitchen
- Food/meal availability
- Wi-Fi
- Cooling
- Security
- Distance from campus
- University/campus
- Rent
- Deposit
- Facilities
- Photos
- Reviews

Normal residential properties must retain their own appropriate fields. Do not force student/PG/hostel fields onto every normal property type.

## 7. Listing Extensibility

Listing forms should support predefined fields appropriate to the selected property/accommodation type and an optional "Add Field" mechanism for legitimate extra information.

Examples:
- Field name: Food
- Value: Available / Not Available

The extra-field mechanism must not replace required structured fields.

## 8. Role-Based Product Rules

- Admin sees admin functionality.
- Property Manager sees property-management functionality.
- Tenant sees normal residential-property functionality.
- Student sees student-housing functionality.
- Student and Tenant are distinct roles and must not be treated as interchangeable.
- Frontend visibility is only a UX layer; backend authorization is mandatory.
- Direct URL/API access must also be protected.

## 9. Non-Goals

- Do not redesign the entire UI when implementing backend/security fixes.
- Do not remove existing working functionality unnecessarily.
- Do not invent unsupported third-party data.
- Do not use fake reviews as if they were genuine customer reviews.
- Do not expose passwords, JWT secrets, or other credentials.
- Do not silently change database fields or role semantics.

## 10. Acceptance Criteria

- All 15 #10 requirements are implemented and testable.
- Each role can access only its intended workflows.
- Student-specific UI does not appear for Tenant.
- "List Your Property" does not appear for Student unless explicitly permitted.
- Backend rejects unauthorized writes even if the frontend is bypassed.
- Ownership isolation works between property managers.
- Applications, agreements, notifications, messages, audit logs, and settings persist correctly.
- Admin reporting is database-driven.
- Relevant frontend pages render without authorization regressions.
- Tests are run before a feature is declared complete.

## 11. Definition of Done

A feature is done only when:
1. Backend implementation exists.
2. Frontend workflow exists where required.
3. Database persistence exists where required.
4. Authorization is enforced server-side.
5. Relevant tests pass.
6. Documentation is updated when a durable architecture/design decision changes.
