# INTEX2

This repo currently contains:

- `backend/` – .NET 10 Web API with JWT auth, EF Core, and Postgres
- `frontend/` – the active Vite + React + TypeScript frontend
- `lighthouse_csv_v7/` – project data assets

The old frontend has been replaced. The current `frontend/` is the migrated Lovable-based UI with the previous app's auth and protected-route functionality moved into it.

## Current app structure

The frontend now includes:

- public marketing pages
- backend-backed login and registration
- persisted auth state
- donor-only and admin-only routes
- admin placeholder routes for future internal tools

Key frontend routes:

- `/`
- `/donors`
- `/impact`
- `/volunteer`
- `/privacy`
- `/login`
- `/register`
- `/donor`
- `/admin`
- `/admin/caseloads`
- `/admin/process-recording`
- `/admin/visits`
- `/admin/reports`

## Backend setup

```bash
cd backend/IntexApi
dotnet run
```

## Frontend/database setup

```bash
cd frontend
npm run db:reset
npm run db:setup
npm run db:seed
npm run dev
```

The API development profile runs on `http://localhost:5180` per [backend/IntexApi/Properties/launchSettings.json](/Users/phoenixfisher/Projects/INTEX2/backend/IntexApi/Properties/launchSettings.json).

The Vite dev server is currently configured for `http://localhost:5173` in [frontend/vite.config.ts](/Users/phoenixfisher/Projects/INTEX2/frontend/vite.config.ts).

## Verification

From `frontend/`:

```bash
npm run build
npm run lint
```

Current status:

- build passes
- lint passes with warnings only from generated/shared UI helper files
