# 500-User Load Smoke

This is a launch smoke, not a full benchmark. Run it against staging or a quiet production window.

## Target Flows

- Login and token refresh.
- `/api/me`, `/api/topics`, and dashboard overview.
- Practice session creation, answer attempts, and completion.
- Flashcard due queue, create/update, and review.
- Admin user search and access update.
- Optional AI upload/run only if AI is enabled.

## Suggested Shape

- 25 concurrent virtual users for 10 minutes.
- 50 concurrent virtual users for 5 minutes.
- One short burst of invalid logins to confirm `429` behavior.

Expected results:

- Error rate below 1% excluding intentional `401`, `403`, and `429` checks.
- p95 API latency below 750 ms for normal reads/writes.
- `/actuator/health` remains `UP`.
- PostgreSQL connections stay below the configured Hikari maximum with headroom.

If the backend is scaled beyond one Railway replica, replace the in-memory rate limiter with Redis-backed rate limiting so limits are shared across instances.
