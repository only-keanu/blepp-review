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
