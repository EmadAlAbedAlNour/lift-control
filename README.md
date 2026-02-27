# Lift Control

Lift Control is a full-stack web platform for an elevator-specialized company (installation + maintenance), built from the project blueprint.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Zod validation
- Cookie session auth (JWT + DB-backed session records)

## Features Implemented

- Public marketing website for services/projects
- Authentication: register, login, logout, reset-password request, refresh session
- Role model: user, supervisor, admin
- Protected pages and role checks (dashboard/settings/admin)
- Dashboard, catalog list/detail, settings, admin panel
- CRUD API for core content
- Unified API validation/error responses
- Rate limiting + security headers
- Integration scaffolds: email, analytics, storage, payment
- CI pipeline (lint + build + DB sync/seed)

## Project Routes

- `/` homepage
- `/auth/login`
- `/auth/register`
- `/auth/reset-password`
- `/dashboard`
- `/catalog`
- `/catalog/[id]`
- `/projects`
- `/projects/[id]`
- `/settings`
- `/admin`

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/reset-password`
- `POST /api/auth/reset-password/confirm`
- `GET, POST /api/content`
- `GET, PUT, DELETE /api/content/:id`
- `GET /api/users`
- `POST /api/users`
- `PUT, DELETE /api/users/:id`
- `GET, PUT /api/settings`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
copy .env.example .env
```

3. Set PostgreSQL credentials in `.env` (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`), then sync DB:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. Run app:

```bash
npm run dev
```

## Default Seed Credentials

- Admin: `emad@liftcontrol.sa` / `Admin@1234`
- Supervisor: `sara@liftcontrol.sa` / `Supervisor@1234`
- User: `omar.client@example.com` / `User@1234`

## Production Checks

```bash
npm run lint
npm run build
```

## Environment Variables

Required:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`

Optional integration vars:

- `RESEND_API_KEY`
- `RESEND_FROM`
- `STORAGE_PROVIDER`
- `STORAGE_UPLOAD_URL`
- `ANALYTICS_PROVIDER`
- `PAYMENT_PROVIDER`
- `NEXT_IMAGE_HOSTS` (comma-separated, defaults to `images.unsplash.com`)
