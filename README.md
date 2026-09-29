# AIIA SmartCTMS

A front-end prototype for a role-based clinical trial management system for Ayurveda research. The app is intentionally demo-first and uses synthetic data only.

## Features
- Portfolio dashboard with study registry, personas and role-based navigation
- Study drill-down views and lifecycle overview
- KPI catalog implemented as pure functions in `src/kpi`
- Alert and audit data layer with local demo persistence
- Login persona switcher and access-restricted route handling

## Stack
- React 18 + Vite + TypeScript
- Tailwind CSS
- React Router v6
- Zustand
- Recharts
- Zod
- date-fns
- lucide-react
- TanStack Table
- Vitest

## Local demo reset
`npm run dev`

Use browser localStorage reset via the app shell to restore the seeded demo dataset.

## Demo assumptions
- This is a prototype frontend with no backend service.
- Study and participant data are synthetic and pseudonymous.
- Footer messaging clearly indicates the app is a prototype and does not file with CTRI/CDSCO.

## Demo script
1. Sign in with a persona from the login screen.
2. Review dashboard metrics and portfolio registry.
3. Open a study and review lifecycle and profile data.
4. Switch personas to validate role-based access.
5. Review the alert and safety cards.

## Persona list
- Principal Investigator
- Study Coordinator
- Monitor (CRA)
- Ethics Committee (IEC)
- PV Officer
- DSMB
- Leadership
- Regulator
- System Admin
