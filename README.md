# Multi-Tenant SaaS Analytics Dashboard

Production-ready full-stack SaaS analytics dashboard with multi-tenant auth, role-based access control, KPI/charts/activity analytics, and Dockerized local deployment.

## Stack

- Backend: Node.js, Express, TypeScript, MySQL, JWT, Swagger
- Frontend: React, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query, Recharts
- Infra: Docker, docker-compose

## Project Structure

- backend: API server, schema, seed script, tests
- frontend: React SPA with auth, dashboard, admin
- docker-compose.yml: mysql + backend + frontend
- .env.example: required environment variables

## Backend Highlights

- Auth routes:
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/refresh
- User routes:
  - GET /api/users/me
  - PUT /api/users/me
  - DELETE /api/users/me
- Dashboard routes:
  - GET /api/dashboard/metrics
  - GET /api/dashboard/charts
  - GET /api/dashboard/activity
- Admin routes:
  - GET /api/admin/users
  - PUT /api/admin/users/:id/role
  - DELETE /api/admin/users/:id
- Swagger docs: /api/docs
- Security/performance: helmet, cors, rate limiting, mysql2 pool
- Auth model: access token (15m) + refresh token (7d, httpOnly cookie)
- Runtime checks:
  - Health: GET /health
  - Readiness (DB): GET /ready
- Logging: structured JSON request and error logs with request IDs

## Frontend Highlights

- Pages: /login, /register, /dashboard, /admin, 404
- Form validation: React Hook Form + Zod
- State:
  - Zustand for auth session in memory
  - TanStack Query for server state
- Charts: line, bar, and pie via Recharts
- Activity feed: filtering, pagination, virtualization when rows > 100
- Performance: route-level code splitting with React.lazy + Suspense

## Local Development (Without Docker)

### 1. Backend

1. cd backend
2. npm install
3. Copy values from ../.env.example into backend/.env and adjust for your local MySQL
4. Run schema from backend/src/database/schema.sql on MySQL
5. npm run seed
6. npm run dev

### 2. Frontend

1. cd frontend
2. npm install
3. Create frontend/.env with:
   - VITE_API_BASE_URL=http://localhost:4000/api
4. npm run dev

## Docker Development

1. From project root run:
   - docker compose up --build
2. Services:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000
   - Swagger: http://localhost:4000/api/docs
  - Health: http://localhost:4000/health
  - Readiness: http://localhost:4000/ready

  ## Quick Runbook

  Use this when you want a fast, repeatable local check.

  1. Start services:
    - docker compose up --build -d
  2. Verify containers:
    - docker compose ps
  3. Verify API:
    - GET http://localhost:4000/health
    - GET http://localhost:4000/ready
  4. Open app:
    - http://localhost:5173

  ### Login Credentials

  - Tenant slug: acme-growth
  - Email: admin@acme-growth.com
  - Password: password

  ### Create New Account

  - Go to /register and enter a new tenant slug (for example, my-new-tenant)
  - First user for a new slug becomes tenant admin automatically

  ### Troubleshooting

  - If MySQL port 3306 is busy on your machine, this project maps host 3307 to container 3306
  - If auth fails after changes, rebuild backend and frontend:
    - docker compose up --build -d
  - If browser shows stale UI state, hard refresh the page

## Security Checklist

- Keep JWT secrets long and unique per environment
- Use secure cookie mode in production:
  - COOKIE_SECURE=true
- Restrict CORS origin to trusted frontend domains
- Rotate refresh tokens and revoke on logout (implemented)
- Never commit `.env` files with real secrets

## Deployment Checklist

- Run CI checks on every PR/push (lint, tests, builds)
- Run DB schema migrations before starting new API versions
- Seed only in non-production environments
- Monitor `/health` and `/ready` in orchestration probes
- Set `NODE_ENV=production` in production runtime

## Testing

Backend tests include required scenarios and mock DB-facing model modules:

- POST /api/auth/register
  - success
  - validation errors
- POST /api/auth/login
  - success
  - wrong password
- GET /api/dashboard/metrics
  - authenticated
  - unauthenticated

Run tests:

1. cd backend
2. npm test

## Seeded Demo Credentials

- Tenant slug: acme-growth
- Admin email: admin@acme-growth.com
- Password: password

## Notes

- API response shape is consistent:
  - { success: boolean, data?: any, error?: string, message?: string }
- Raw SQL is used throughout (no ORM)
- TypeScript strict mode is enabled on backend and frontend
