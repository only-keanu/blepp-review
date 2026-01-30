# Backend Overview

## Modules
- `auth` – JWT auth, login/register/refresh
- `users` – profile endpoints (`/api/me`)
- `topics` – BLEPP standard topics + per-user weak flags
- `questions` – question CRUD + search
- `practice` – practice sessions, attempts, mistakes
- `flashcards` – CRUD + review scheduling
- `exams` – mock exams (scaffolded)
- `analytics` – progress analytics (scaffolded)
- `generation` – PDF upload + AI generation (scaffolded)

## Security
- JWT bearer token required for all routes except `/api/auth/**`
- Tokens are issued by `AuthServiceImpl`
- `JwtAuthenticationFilter` reads `Authorization: Bearer <token>`

## Data storage
Postgres with Flyway migrations under `src/main/resources/db/migration`.
