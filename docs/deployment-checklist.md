# Deployment Checklist

Use this before each production deploy.

## Backend

- `SPRING_PROFILES_ACTIVE=prod`
- Railway backend service root is `blepp-review-backend/demo`.
- Backend public URL is known before building the frontend.
- Railway healthcheck path is `/actuator/health`.
- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` point to the production PostgreSQL database.
- Prefer Railway private PostgreSQL networking where available; use a JDBC URL such as `jdbc:postgresql://<private-host>:5432/railway`.
- `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`
- `SPRING_FLYWAY_ENABLED=true`
- `SPRING_FLYWAY_BASELINE_ON_MIGRATE=true`
- `SPRING_FLYWAY_BASELINE_VERSION=9`
- `APP_JWT_SECRET` is a production-only base64-encoded 256-bit secret.
- `APP_ADMIN_EMAILS` contains the exact comma-separated email addresses that should receive admin access.
- `APP_CORS_ALLOWED_ORIGINS` contains the deployed frontend origin.
- Rate limits are left enabled unless performing a controlled migration or internal smoke:
  - `APP_RATE_LIMIT_AUTH_CAPACITY=10`
  - `APP_RATE_LIMIT_REFRESH_CAPACITY=30`
  - `APP_RATE_LIMIT_GENERATION_CAPACITY=10`
  - `APP_RATE_LIMIT_STUDY_WRITE_CAPACITY=120`
- `APP_OAUTH_GOOGLE_CLIENT_ID`, `APP_OAUTH_GOOGLE_CLIENT_SECRET`, `APP_OAUTH_FACEBOOK_APP_ID`, and `APP_OAUTH_FACEBOOK_APP_SECRET` are set when OAuth login is enabled.
- AI generation launch decision is explicit:
  - Enabled: set `APP_OPENAI_API_KEY`, `APP_OPENAI_MODEL`, `APP_GENERATION_UPLOAD_DIR`, `APP_GENERATION_MAX_PDF_BYTES`, `APP_GENERATION_CONNECT_TIMEOUT_SECONDS`, and `APP_GENERATION_READ_TIMEOUT_SECONDS`.
  - Disabled: leave `APP_OPENAI_API_KEY` blank and confirm the frontend/paywall copy treats generation as unavailable until payment/configuration.
- Startup logs show `startup_config` with active profile, CORS origins, OpenAI configured state, generation model/upload dir, and `flyway_status` without printing secrets.

## Frontend

- Railway frontend service root is the repository root.
- Railway healthcheck path is `/health`.
- Local `.env`: `VITE_API_BASE_URL=http://localhost:8080`
- Production build environment: `VITE_API_BASE_URL=<deployed backend URL>`
- Only `VITE_*` public values are configured in the frontend service. Backend secrets stay in the backend service.
- Rebuild and redeploy the frontend after changing `VITE_API_BASE_URL`.

## Database

- Railway PostgreSQL service is attached before the backend deploy.
- Current Flyway migration is `V11__generation_job_status_index.sql` or later.
- Backups are enabled or scheduled before inviting real users.
- A restore path has been tested against a disposable Railway PostgreSQL service.

## Smoke Test

- Deploy backend first and confirm `/actuator/health` returns healthy.
- Confirm frontend `/health` returns `200`.
- Open a deep frontend link such as `/dashboard` and confirm it serves the SPA instead of `404`.
- Log in with an email from `APP_ADMIN_EMAILS` through the deployed frontend.
- Confirm `/api/me` returns `admin: true`, `hasStudyAccess: true`, and `hasAiAccess: true`.
- Confirm the frontend sidebar shows `Users` only for the admin account.
- Open `/dashboard/admin/users`, search for a user, grant paid access, and verify `/api/me` returns `accessStatus: PAID`.
- Revoke access for a test user and confirm study and AI workflows return `403` while `/api/me` still returns `200`.
- For an expired test user, verify practice session creation and flashcard actions are blocked with `403`.
- For a paid test user, verify flashcards and practice flows load, create/update, and complete successfully.
- If AI is enabled, upload a small PDF, run generation, and verify generated questions or a clear provider failure message.
- If AI is disabled, confirm `/api/generation/run` returns `503` with the configured-unavailable message and the frontend does not imply generation is live.
- Send repeated invalid login attempts and confirm the backend returns `429` with `Retry-After`.
- Confirm API responses include `X-Request-Id` and security headers such as `X-Content-Type-Options`.
