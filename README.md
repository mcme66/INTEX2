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

### 1. Configure Postgres and JWT

Edit [backend/IntexApi/appsettings.json](/Users/phoenixfisher/Projects/INTEX2/backend/IntexApi/appsettings.json):

- `ConnectionStrings:Default`: your local Postgres connection string
- `Jwt:Key`: a long random secret

You can also override the connection string via environment variable:

```bash
ConnectionStrings__Default="Host=...;Port=5432;Database=...;Username=...;Password=..."
```

### Team note (important)

Do **not** commit `backend/IntexApi/appsettings.Development.json` (each developer will have different local DB credentials/settings).

- Use `backend/IntexApi/appsettings.Development.example.json` as the template (this file is safe to commit)
- Each developer should copy it to `backend/IntexApi/appsettings.Development.json` locally (gitignored)
- Alternatively, store per-developer secrets via .NET User Secrets or environment variables

### 2. Apply the database

From the repo root:

```bash
dotnet ef database update --project backend/IntexApi/IntexApi.csproj
```

### 3. Run the API

```bash
dotnet run --project backend/IntexApi/IntexApi.csproj
```

The API development profile runs on `http://localhost:5180` per [backend/IntexApi/Properties/launchSettings.json](/Users/phoenixfisher/Projects/INTEX2/backend/IntexApi/Properties/launchSettings.json).

Auth endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Frontend setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Run the frontend

```bash
npm run dev
```

The Vite dev server is currently configured for `http://localhost:5173` in [frontend/vite.config.ts](/Users/phoenixfisher/Projects/INTEX2/frontend/vite.config.ts).

### 3. API base URL

The frontend expects:

```bash
VITE_API_URL=http://localhost:5180
```

If `VITE_API_URL` is not set, the frontend falls back to `http://localhost:5178`, so setting `VITE_API_URL` is recommended.

## Verification

From `frontend/`:

```bash
npm run build
npm run lint
```

Current status:

- build passes
- lint passes with warnings only from generated/shared UI helper files
