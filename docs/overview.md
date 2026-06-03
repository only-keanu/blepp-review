# Backend Overview

## Modules
- `auth` - JWT auth, login/register/refresh
- `users` - profile endpoints (`/api/me`) and access state
- `topics` - BLEPP standard topics + per-user weak flags
- `questions` - question CRUD + search
- `practice` - practice sessions, attempts, mistakes
- `flashcards` - CRUD + review scheduling
- `exams` - mock exam sessions, answers, flags, and results
- `analytics` - overview, topic mastery, readiness, and accuracy trend data
- `generation` - PDF upload + AI question generation for paid/admin users when OpenAI is configured

## Security
- JWT bearer token required for all routes except `/api/auth/**`
- Study routes enforce backend access checks; trial, paid, expired, and admin state is returned by `/api/me`.
- AI generation requires paid/admin access and `APP_OPENAI_API_KEY`.
- Tokens are issued by `AuthServiceImpl`
- `JwtAuthenticationFilter` reads `Authorization: Bearer <token>`

## Data storage
Postgres with Flyway migrations under `src/main/resources/db/migration`.
