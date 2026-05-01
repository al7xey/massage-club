# Massage Subscription Platform

Учебный fullstack-проект для курсовой работы: веб-приложение массажной сети, которая продает услуги по подписочной модели.

## Архитектура

- `apps/client` — React, TypeScript, Vite, Redux Toolkit, RTK Query, Feature-Sliced Design.
- `apps/server` — NestJS, TypeScript, TypeORM, PostgreSQL, Swagger, модульный монолит.
- `packages/shared` — общие enum и DTO-типы, включая `UserRole`.
- `docker-compose.yml` — PostgreSQL для локальной разработки.

## Установка

На Windows удобнее запускать команды через `cmd /c`, потому что PowerShell может блокировать `.ps1`-обертки npm/pnpm.

```bash
cmd /c pnpm install
```

Скопируйте переменные окружения:

```bash
copy .env.example .env
```

## PostgreSQL через Docker

```bash
cmd /c docker compose up -d
```

Если на `localhost:5432` уже запущен локальный PostgreSQL, остановите его или измените `POSTGRES_PORT` в `.env`, иначе backend может подключиться не к контейнеру.

Параметры базы по умолчанию:

- host: `localhost`
- port: `5432`
- database: `massage_subscriptions`
- user: `massage_app`
- password: `massage_password`

## Backend

Запуск NestJS API:

```bash
cmd /c pnpm --filter server start:dev
```

Swagger доступен по адресу:

```text
http://localhost:3000/api/docs
```

Seed-данные:

```bash
cmd /c pnpm --filter server seed
```

Тестовые аккаунты:

| Роль | Email | Пароль |
| --- | --- | --- |
| CLIENT | `client@example.com` | `password123` |
| ADMIN | `admin@example.com` | `password123` |
| SUPER_ADMIN | `superadmin@example.com` | `password123` |

## Frontend

Запуск Vite:

```bash
cmd /c pnpm --filter client dev
```

Frontend будет доступен по адресу:

```text
http://localhost:5173
```

## Env-переменные

Основные переменные находятся в `.env.example`:

- `SERVER_PORT` — порт backend.
- `API_PREFIX` — глобальный префикс API, по умолчанию `api`.
- `CORS_ORIGIN` — origin frontend.
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` — подключение к PostgreSQL.
- `DATABASE_SYNCHRONIZE` — dev-синхронизация TypeORM-схемы.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — секреты JWT.
- `VITE_API_BASE_URL` — адрес API для frontend.

## REST API каркас

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/services`
- `GET /api/services/:id`
- `GET /api/studios`
- `GET /api/studios/:id`
- `GET /api/masters`
- `GET /api/masters/:id`
- `GET /api/subscription-plans`
- `POST /api/subscriptions`
- `GET /api/subscriptions/me`
- `PATCH /api/subscriptions/:id/freeze`
- `PATCH /api/subscriptions/:id/cancel`
- `POST /api/appointments`
- `GET /api/appointments/my`
- `PATCH /api/appointments/:id/cancel`
- `POST /api/gift-certificates`
- `GET /api/gift-certificates/my`
- `GET /api/gift-certificates/:code`
- `POST /api/payments/mock-checkout`
- `GET /api/payments/:id`
- `GET /api/admin/appointments`
- `GET /api/admin/users`
- `GET /api/admin/analytics/summary`
- CRUD `/api/admin/services`
- CRUD `/api/admin/studios`
- CRUD `/api/admin/masters`
- CRUD `/api/admin/master-shifts`
- CRUD `/api/admin/subscription-plans`
- CRUD `/api/admin/gift-certificates`

## Что уже заложено

- Авторизация JWT и refresh-token каркас.
- Роли `CLIENT`, `ADMIN`, `SUPER_ADMIN`; гость не хранится в базе.
- Guards для авторизации и ролей.
- PostgreSQL entities для основных бизнес-сущностей.
- Проверка двойного бронирования мастера на уровне `AppointmentsService`.
- Mock-payment без настоящей платежной интеграции.
- Собственное расписание мастеров в базе, без CRM/YCLIENTS.
- Минимальные frontend-страницы без сложного дизайна.

## Проверка

```bash
cmd /c pnpm --filter @massage/shared build
cmd /c pnpm --filter server build
cmd /c pnpm --filter client build
```

После запуска backend и seed можно проверить публичные endpoints:

```bash
curl http://localhost:3000/api/services
curl http://localhost:3000/api/studios
curl http://localhost:3000/api/subscription-plans
```
