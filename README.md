# Tell'em - User Service

User/auth microservice for **Tell'em** (SoundCloud-like pet project).

## Features

- Auth: register, login, refresh, logout
- User: `me`, update profile, public profile by username
- Sessions: list of active sessions of the current user

## Tech stack

- Runtime: Node.js
- Framework: NestJS (`@nestjs/platform-fastify`)
- DB: PostgreSQL
- ORM: Prisma
- Crypto: argon2
- JWT: jsonwebtoken
- Validation: class-validator + ValidationPipe

## Requirements

- Node.js 18+ (22+ recommended)
- PostgreSQL 14+

## Quick start

1) Install deps

```bash
npm i
```

2) Create .env

3) Generate Prisma client + run migrations

```bash
npx prisma generate
npx prisma migrate dev
```

4) Run service

```bash
npm run start:dev
```

The service starts on APP_PORT and will have a global prefix of /api.

## Environment variables

See .env.example for all available environment variables and their structure.

## API

> POST /api/auth/register

Headers:

- x-device-id: <string> (required)

Body:
```json
{
  "username": "user_123",
  "birthDate": "2000-01-01",
  "email": "user@mail.com",
  "password": "StrongP@ssw0rd!"
}
```

Response:
```json
{
  "access": "<access-jwt>",
  "refresh": "<refresh-jwt>",
  "user": { "...private user fields..." }
}
```

Also sets the refreshToken cookie (httpOnly).