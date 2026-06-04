# Railway Deployment

Target topology:

- Railway PostgreSQL service.
- Railway backend service from `blepp-review-backend/demo`.
- Railway frontend service from the repository root.

## PostgreSQL

Create the Railway PostgreSQL service first. Use the private host/JDBC connection string for the backend when possible:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://<railway-private-host>:5432/railway
SPRING_DATASOURCE_USERNAME=<railway-user>
SPRING_DATASOURCE_PASSWORD=<railway-password>
```

Enable regular backups before launch. For a 500-user MVP, daily backups plus a tested restore into a disposable database are enough.

## Backend Service

Set the Railway service root to `blepp-review-backend/demo`. The checked-in `nixpacks.toml` builds the Spring Boot jar and starts with the Railway `$PORT`.

Required production variables:

```text
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://<railway-private-host>:5432/railway
SPRING_DATASOURCE_USERNAME=<railway-user>
SPRING_DATASOURCE_PASSWORD=<railway-password>
APP_JWT_SECRET=<base64-encoded-32-byte-secret>
APP_CORS_ALLOWED_ORIGINS=https://<frontend-domain>
APP_ADMIN_EMAILS=admin@example.com
```

Keep `APP_OPENAI_API_KEY` blank until AI generation is intentionally enabled. The backend returns a clear `503` for generation runs when it is not configured.

Railway healthcheck:

```text
/actuator/health
```

## Frontend Service

Set the Railway service root to the repository root. The root `nixpacks.toml` runs `npm ci`, builds Vite, and starts `vite preview` on Railway `$PORT`.

Required production variables:

```text
VITE_API_BASE_URL=https://<backend-domain>
VITE_GOOGLE_CLIENT_ID=<public-google-client-id-if-enabled>
VITE_FACEBOOK_APP_ID=<public-facebook-app-id-if-enabled>
```

Do not add backend secrets to the frontend service. Railway healthcheck path:

```text
/health
```

## Rollback

Use Railway deployment history to roll back frontend and backend separately. If a migration has already applied, roll back application code only after confirming the older code remains compatible with the current schema.
