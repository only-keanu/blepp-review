# BLEPP Review Backend Docs

This folder provides developer-facing documentation for the backend. It is intended to be a quick reference for local setup, authentication, production deployment, and core API usage.

## Contents

- `overview.md` - architecture and module map
- `setup.md` - local setup (Postgres + JWT)
- `api.md` - endpoint guide and sample flows
- `deployment-checklist.md` - production deploy checklist
- `railway-deployment.md` - Railway frontend/backend/PostgreSQL setup
- `incident-runbook.md` - launch incident response steps
- `load-smoke-500-users.md` - small-scale load-smoke plan

## Quick Start

1. Start Postgres and create database/user.
2. Run the Spring Boot app from IntelliJ.
3. Import `postman/blepp-review.postman_collection.json` into Postman.
4. Run Login and then test endpoints.
