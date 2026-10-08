# WayHome — Online Real Estate Management System

WayHome is a role-based real estate and student accommodation management system built with React/Vite, Spring Boot, Spring Security/JWT, and MySQL.

## Project Context
The repository root includes the canonical coding-agent context:
- `PRD.md`
- `Architecture.md`
- `Rules.md`
- `Design.md`
- `Task.md`

The final verification covered all 15 Project #10 requirements, with 15/15 reported PASS and separate ADMIN, PROPERTY_MANAGER, TENANT, and STUDENT role verification.


A responsive real estate and student accommodation application with a React frontend and Spring Boot + MySQL backend: neutral surfaces, dark navy buttons, lightweight Inter headings and compact photo cards. Built with React 18, Vite, React Router, Tailwind CSS, Context API, Framer Motion, Lucide and React Leaflet. Fonts and imagery are hosted locally.

## Run locally

Install Node.js 20 or later, extract the ZIP, and open a terminal in the project folder:

```bash
cd frontend
npm ci
npm run dev
```

Open **http://localhost:4173** and keep the terminal running. The frontend can run in offline demo mode. To use the real backend, copy `frontend/.env.example` to `frontend/.env`, keep `VITE_API_BASE_URL=http://localhost:8080/api`, and start the backend as described in `backend/README.md`.

## Production build

```bash
# From the project root
npm run build
```

This generates the static frontend in `dist/`. Configure the hosting service to serve `index.html` for React Router routes. Building from `frontend/` instead creates `frontend/dist/`.

## Included flows

- Split apartment hero, Rent / Buy / PG tabs, search, featured homes and university housing.
- Three-column property listings with location, property type, minimum/maximum budget, bedrooms, amenities, furnishing, metro distance and sorting.
- Shared URL filters between grid and interactive map search, selectable map pins and “Search this area”.
- Property and accommodation details with photo galleries, facilities, local reviews, nearby places, owner contact and application forms.
- State → city → university accommodation search, popular universities, distance/budget filters and grid/map views.
- Saved properties, comparisons, applications and conversations that persist on this device in demo mode.
- Tenant/student dashboards with saved homes, applications, messages, notifications, agreement summaries and profile settings.
- Owner dashboard, listing management and a seven-step property wizard with draft saving, photo uploads, pricing and a preview.
- Admin workspace with user management, listing approvals, reports and illustrative charts.
- Matching login/register screens, a demo password recovery flow, responsive navigation, accessible labels, reduced-motion support and loading/empty/error states.

## What changed in this update

- Rebuilt the homepage hero with a blended living-room photograph, integrated trust features, Rent / Buy / PG tabs and a compact search panel.
- Reworked Student Housing with a campus hero, university search and five popular-campus cards. Choosing a university opens listings with a slim filter sidebar and three cards per row on desktop.
- Added facility filters and nearest, price and rating sorting while retaining shared URL state between the grid and map.
- Matched the property detail composition with a gallery, central information and tabs, plus a map and owner card on the right.
- Updated dashboard navigation, summary cards and four-column recommendations; carried the neutral design through login, registration, listing forms and other workspaces.
- Added matching illustrative room imagery and six sample listings. Student map pins use red for homes and blue for the selected campus.
- Retained saved homes, comparisons, applications, messages, gallery controls and mobile layouts.

The final reference overrides are in `frontend/src/styles/reference.css`, imported after the existing component and responsive styles.

## Demo mode vs live mode

If `VITE_API_BASE_URL` is empty, this is a self-contained preview with sample properties, reviews, people and applications. If it is configured, property/accommodation search, authentication, applications, dashboards, messaging and notifications use the Spring Boot API and MySQL database. Choose **Explore a demo workspace** on the login screen to try Tenant, Student, Property Owner or Admin without an account. Demo data is stored in browser local storage; demo sessions use local or session storage according to “Remember me”. Demo application submissions and messages do not contact real people. Owner submissions stay pending until approved in the local admin workspace.

Demo registration does not create a real account. Google and Apple sign-in are unavailable. Password recovery demonstrates the steps using the displayed demo code; it does not send an email or change a real password. Agreement downloads are plain-text demo summaries, not executed contracts. Dashboard charts marked illustrative use sample data. Photos and approximate map locations illustrate the interface; they are not verified rental offers. New campus and interior imagery is generated and does not depict the named universities or properties. Image notes are in `frontend/public/assets/reference/SOURCES.md` and `frontend/public/assets/marketplace/SOURCES.md`. Map tiles require internet access.

## Connecting the backend

Copy `frontend/.env.example` to `frontend/.env`, set `VITE_API_BASE_URL=http://localhost:8080/api`, and restart Vite. The API client automatically attaches the JWT returned by login. The backend is in `backend/`; see `backend/README.md` for MySQL, environment variables and seeded demo accounts.

Password recovery is implemented as a local verification-code flow because no email provider is configured. The response exposes a temporary development code so the college demo can be tested end-to-end. Configure a real email provider before production use. Social sign-in, real payment processing and real third-party property verification are intentionally outside this project build.

## Checks

```bash
npm test
npm run build
```

The automated tests cover combined URL filters, sale-price budgets, approval visibility, bedroom/security matching, Indian price formatting, campus filters and exact budget/distance boundaries. Route components are lazy loaded to keep the initial download smaller.

The frontend utility test suite passes. Plain JavaScript syntax and relative imports were also checked. Full Vite/Maven builds require the project dependencies/tools to be installed on the local machine.

## Structure

- `frontend/src/components/` — shared UI, cards, maps, details and workspace layout
- `frontend/src/pages/` — public routes and role dashboards
- `frontend/src/context/` — session and theme state
- `frontend/src/data/` — illustrative listings and sample data
- `frontend/src/services/` — API client and persistent demo data
- `frontend/src/utils/` — filtering, price formatting, saved items and comparisons
- `frontend/src/styles/` — shared tokens, component styles, page layouts and responsive rules
- `frontend/public/assets/` — local photography and fonts
- `backend/` — supplied Java backend source

The original architecture, ER diagram and roadmap pages remain in the footer’s Project resources menu.
