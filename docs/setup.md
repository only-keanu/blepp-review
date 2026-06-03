# Local Setup

## Requirements
- Java 21
- Postgres 14+
- IntelliJ (or CLI)

## Database
Create the database and user (example):

```sql
CREATE DATABASE blepp_review;
CREATE USER blepp WITH PASSWORD 'blepp';
GRANT ALL PRIVILEGES ON DATABASE blepp_review TO blepp;
```

## Spring profiles
`application.properties` enables the `local` profile by default.
Configuration is in `application-local.properties`.

Nixpacks deployments default to the `prod` profile. Production requires:

```text
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
SPRING_JPA_HIBERNATE_DDL_AUTO
SPRING_FLYWAY_ENABLED
SPRING_FLYWAY_BASELINE_ON_MIGRATE
SPRING_FLYWAY_BASELINE_VERSION
APP_JWT_SECRET
APP_CORS_ALLOWED_ORIGINS
APP_ADMIN_EMAILS
```

Google/Facebook login also requires the matching backend OAuth values:

```text
APP_OAUTH_GOOGLE_CLIENT_ID
APP_OAUTH_GOOGLE_CLIENT_SECRET
APP_OAUTH_FACEBOOK_APP_ID
APP_OAUTH_FACEBOOK_APP_SECRET
```

AI generation is launch-ready only when these are intentionally configured. Leave `APP_OPENAI_API_KEY` blank to keep generation unavailable at runtime; paid users will receive a clear `503` from `/api/generation/run`.

```text
APP_OPENAI_API_KEY
APP_OPENAI_MODEL
APP_GENERATION_UPLOAD_DIR
APP_GENERATION_MAX_PDF_BYTES
APP_GENERATION_CONNECT_TIMEOUT_SECONDS
APP_GENERATION_READ_TIMEOUT_SECONDS
```

## JWT secret
Replace the dev secret in `application-local.properties` for real deployments.

To generate a 32-byte base64 secret (PowerShell):
```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

## Run
Run `DemoApplication` from IntelliJ.
