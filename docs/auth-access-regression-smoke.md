# Auth and Access Regression Smoke

Run this against staging before launch and after auth/access changes.

## Setup
- Use one admin email from `APP_ADMIN_EMAILS`.
- Use one normal user with active trial access.
- Use one normal user whose access can be set to `EXPIRED`.
- Keep browser devtools network panel open.

## Checks
- Reload persistence: log in as the trial user, reload `/dashboard`, and confirm the user remains logged in and `/api/me` returns `200`.
- Expired access token refresh: shorten `APP_JWT_ACCESS_EXPIRATION_MINUTES` in staging or wait for expiry, then navigate to `/dashboard/study/practice`; confirm `/api/auth/refresh` succeeds and the original request is retried.
- Invalid refresh logout: replace the stored refresh token with an invalid value, trigger a protected request, and confirm local tokens are cleared and the app returns to `/auth/login`.
- Access gate: set the user to `EXPIRED`, reload `/dashboard/study/practice`, and confirm the frontend shows the locked access state while the API returns `403` for practice, flashcards, questions, exams, and lesson progress writes.
- Admin-only gate: log in as a non-admin user and confirm `/dashboard/admin/users` shows the admin access state while `/api/admin/users` returns `403`.
- AI gate: verify trial users see the AI access state, expired users receive `403`, and paid/admin users either reach generation or receive the configured `503` when OpenAI is intentionally disabled.
