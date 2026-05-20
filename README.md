# Massage Club Monorepo

Монорепозиторий платформы абонементов для сети массажных студий.

## Стек

- `apps/client`: React 18, Vite, TypeScript, React Router, Redux Toolkit / RTK Query
- `apps/server`: NestJS, TypeORM, PostgreSQL
- `packages/shared`: общие enum, DTO-типы и чистая бизнес-логика
- `tests`: node:test проверки shared-логики

## Быстрый старт

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env` из шаблона:

```bash
cp .env.example .env
```

3. Поднять PostgreSQL через Docker:

```bash
npm run docker:up
```

4. Заполнить демо-данные:

```bash
npm run seed
```

5. Запустить frontend и backend:

```bash
npm run dev
```

Клиент по умолчанию: `http://localhost:5173`  
API по умолчанию: `http://localhost:3000/api`  
Swagger: `http://localhost:3000/api/docs`

## Полезные команды

```bash
npm run dev
npm run typecheck
npm test
npm run build
npm run seed
npm run docker:up
npm run docker:down
```

## Архитектура

- Frontend следует Feature-Sliced Design: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- Новые API-запросы добавляются через RTK Query и `shared/api/baseApi.ts`.
- Общие клиент-серверные контракты и чистые расчёты живут в `packages/shared`.
- TypeORM entities остаются только в `apps/server`.
- Общие UI-примитивы находятся в `apps/client/src/shared/ui`.

