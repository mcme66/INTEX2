# Frontend

This is the active frontend for the project.

It uses the Lovable-designed UI as the base and includes migrated functionality from the previous frontend:

- login and registration
- auth persistence
- role-protected donor and admin routes
- donor/admin dashboard entry points

## Run locally

```bash
npm install
npm run dev
```

The Vite dev server is configured to run on `http://localhost:5173`.

## Required environment

Set:

```bash
VITE_API_URL=http://localhost:5180
```

If `VITE_API_URL` is not provided, the app falls back to `http://localhost:5178`, which does not match the backend development port in this repo.

## Useful commands

```bash
npm run build
npm run lint
npm run test
```
