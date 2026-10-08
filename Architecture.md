# WayHome — Architecture

## 1. Purpose

This document is the technical source of truth for the WayHome repository. Coding agents must inspect and follow this architecture before modifying code.

## 2. Known Stack

### Backend
- Java
- Spring Boot 3.2.5
- Spring Web
- Spring Data JPA
- Spring Security
- JWT authentication
- MySQL
- Lombok
- Maven

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Leaflet/maps where applicable

## 3. High-Level Flow

User
-> React/Vite frontend
-> API client
-> Spring Boot REST controller
-> Service layer
-> Repository layer
-> MySQL database

Authentication:
User
-> login endpoint
-> JWT
-> frontend stores/uses authenticated session
-> Authorization header
-> Spring Security
-> controller/service authorization
-> database

## 4. Backend Responsibility

### Controllers
Controllers expose REST APIs and should:
- Validate request boundaries.
- Obtain authenticated identity from the security context.
- Delegate business logic to services.
- Avoid embedding complex business rules.

### Services
Services own:
- Business rules
- Ownership checks
- Role checks
- Application/agreement workflows
- Notification generation
- Audit logging
- Analytics calculations

### Repositories
Repositories own persistence queries and database access.

### Security
Spring Security/JWT is the authoritative authentication/authorization boundary.

Never trust client-supplied:
- userId
- ownerId
- senderId
- role
when the value can be derived from the authenticated identity.

## 5. Core Domain Areas

Known project domain areas include:
- User
- Property
- Accommodation
- Application
- Agreement/Rental Agreement
- Message
- Notification
- Audit Log
- System Settings
- Tenant/profile/rental history
- Analytics/reporting
- Recommendation/map functionality

Use the repository's actual entity names and relationships when modifying existing code.

## 6. Role Model

Roles currently relevant to the project:
- ADMIN
- PROPERTY_MANAGER
- TENANT
- STUDENT

### Authorization principle

Role controls capability, but resource ownership controls which resource can be modified.

Example:
- PROPERTY_MANAGER can modify own property.
- PROPERTY_MANAGER cannot modify another manager's property.
- ADMIN can perform administrator-level operations according to configured policy.
- TENANT/STUDENT cannot create normal property listings.

## 7. Property Types

Do not create one universal form containing every possible field.

Use type-aware schemas/forms where appropriate.

### Normal Residential Property
Examples:
- Flat/apartment
- Villa
- House
- Other residential rental/sale property

Possible fields:
- title
- type
- location
- city/state/pin
- rent/sale price
- furnishing
- bedrooms
- bathrooms
- area
- parking
- security
- power backup
- Wi-Fi
- other relevant amenities
- photos

### Student Accommodation
Examples:
- PG
- Hostel
- Student housing

Possible fields:
- sharing type
- bed
- furnishing
- bathroom
- kitchen
- food availability
- Wi-Fi
- cooling
- security
- campus/university
- distance from campus
- rent
- deposit
- facilities
- photos
- reviews

## 8. Extensible Listing Fields

The listing form may provide an optional extra-field mechanism.

Recommended conceptual structure:
- fieldName
- fieldValue
- optional fieldType

The system should validate field names/values and prevent arbitrary executable content.

Required fields remain structured and searchable.

## 9. Frontend Role Routing

The frontend should use authenticated role state to determine:
- navigation
- dashboard
- visible actions
- route guards

However, route hiding is not security.

Backend authorization must reject unauthorized API requests.

## 10. Important Existing/Relevant Modules

Known project modules include service areas such as:
- PropertyService
- TenantService
- AgreementService
- ApplicationService
- UserService
- NotificationService
- MessageService
- AuditLogService
- SystemSettingService
- AdminAnalyticsService
- RecommendationService
- MapService

Exact implementation should be inspected before creating duplicates.

## 11. Data Persistence

Persistent entities must remain after application restart.

At minimum verify persistence for:
- users
- properties
- applications
- agreements
- messages
- notifications
- audit logs
- system settings

## 12. Analytics

Analytics must be calculated from actual persisted data.

Recommendation logic is not automatically equivalent to listing analytics.

Listing analytics should have explicit metrics such as:
- listing views/interactions where available
- application counts
- pending/approved/rejected applications
- active listings
- agreement-related counts
- other metrics actually supported by stored data

Do not claim a metric exists if the database does not provide the underlying data.

## 13. Audit Logging

Important state-changing actions should generate persistent audit records.

Useful fields include:
- actor
- action
- entity type
- entity ID
- details
- timestamp
- IP address where supported

Audit endpoints are admin-only.

## 14. External Services

Do not invent external API credentials or services.

If maps/geocoding or other external integrations exist, keep provider-specific logic isolated behind the existing service boundary.

## 15. Architecture Change Rule

If a durable architecture decision changes:
1. Update this document.
2. Update Rules.md if the change creates a non-negotiable rule.
3. Update Design.md if UI behavior/design changes.
4. Update Task.md with the reason and implementation status.

Do not silently change core authentication, database schema, or role semantics.
