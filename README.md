# Civic Aid Quest

## What this project is
- A Vite + React + TypeScript civic service portal with role-based citizen/staff experiences.
- Uses Supabase for auth, profile roles, and service-request workflows.
- UI stack is Tailwind CSS + shadcn/ui (Radix primitives), with React Query for client-side data fetching orchestration.

## High-level architecture
- **Frontend shell**: `src/main.tsx` mounts a single `App` router tree.
- **Routing and access control**: `src/App.tsx` defines public and protected routes (citizen/staff/manager).
- **Auth context**: `src/contexts/AuthContext.tsx` tracks session/user/role and reads role from `profiles`.
- **Backend integration**: `src/integrations/supabase/client.ts` initializes a Supabase JS client.

## Core product surfaces
- **Public landing/login**: `src/pages/Index.tsx`, `src/pages/LoginPage.tsx`, `src/pages/StaffLoginPage.tsx`, `src/pages/RegisterPage.tsx`.
- **Citizen experience**: `src/pages/CitizenPortalPage.tsx` supports request submission, multilingual support, status view, and request history.
- **Staff workflows**:
  - Queue/filter view: `src/pages/StaffTicketQueuePage.tsx`
  - Ticket detail management: `src/pages/StaffTicketDetailPage.tsx`
  - Dashboard/list and analytics pages in `src/pages/`.

## Data/backend notes
- Supabase migrations present for profiles and policy updates in `supabase/migrations/`.
- Edge functions in `supabase/functions/` provide translation pipelines:
  - Translate to English before storage
  - Translate from English for UI output
  - Generic text translation endpoint

## Testing and quality posture
- Vitest is configured (`vitest.config.ts`) with jsdom and test setup under `src/test/`.
- Playwright configuration exists (`playwright.config.ts`) suggesting intended E2E coverage.
- Current README is a placeholder and should be expanded with setup, env vars, and architecture docs.

## Observations and opportunities
1. **Role consistency**: app supports a `manager` role in code, while migration check constraint currently lists only `citizen` and `staff`.
2. **Security hygiene**: Supabase URL + publishable key are hardcoded in client code; consider environment-variable injection for cleaner config management.
3. **Dependency readiness**: local test command fails without installed node modules in a fresh environment.
