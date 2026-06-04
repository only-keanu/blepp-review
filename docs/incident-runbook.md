# Incident Runbook

## Deploy Does Not Become Active

1. Check Railway deployment logs for build or startup errors.
2. Confirm backend healthcheck path is `/actuator/health`.
3. Confirm required env vars are present: database URL, database credentials, `APP_JWT_SECRET`, and `APP_CORS_ALLOWED_ORIGINS`.
4. Roll back to the previous Railway deployment if the healthcheck keeps failing after one restart.

## Database Connection Failure

1. Confirm `SPRING_DATASOURCE_URL` is a JDBC PostgreSQL URL.
2. Prefer the Railway private host from the same project/network.
3. Check Railway PostgreSQL metrics for connection saturation.
4. Temporarily reduce backend concurrency or Hikari pool size if PostgreSQL is saturated.

## Auth Failures

1. Check whether failures are `401`, `403`, or `429`.
2. For broad `401`, confirm `APP_JWT_SECRET` did not change between deployments.
3. For `403`, inspect user access status in the admin screen.
4. For `429`, check rate-limit headers and temporarily raise the relevant `APP_RATE_LIMIT_*` capacity only if traffic is legitimate.

## Access Expiry Complaints

1. Use the admin users screen to inspect `accessStatus`, `trialEndsAt`, and `paidUntil`.
2. Expired users should still be able to call `/api/me` and `/api/topics`.
3. Study and AI write workflows should return `403` until access is restored.

## AI Generation Unavailable

1. If launch intentionally disables AI, confirm `APP_OPENAI_API_KEY` is blank and the `503` configured-unavailable message is expected.
2. If AI should be enabled, confirm `APP_OPENAI_API_KEY`, model, upload size, and provider timeout values.
3. For provider failures, use request ID from the frontend error report to find backend logs.
