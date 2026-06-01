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
APP_JWT_SECRET
```

Google/Facebook login also requires the matching backend OAuth values:

```text
APP_OAUTH_GOOGLE_CLIENT_ID
APP_OAUTH_GOOGLE_CLIENT_SECRET
APP_OAUTH_FACEBOOK_APP_ID
APP_OAUTH_FACEBOOK_APP_SECRET
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
