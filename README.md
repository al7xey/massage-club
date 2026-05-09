# Massage Club Monorepo

Монорепозиторий платформы абонементов для сети массажных студий.

## Стек

- `apps/client`: React + Vite + TypeScript
- `apps/server`: NestJS + TypeScript + TypeORM
- `packages/shared`: общие типы и контракты
- PostgreSQL

## Быстрый старт

1. Установить зависимости:

```bash
pnpm install
```

2. Создать `.env` из шаблона:

```bash
cp .env.example .env
```

3. Поднять PostgreSQL (опционально через Docker):

```bash
pnpm docker:up
```

4. Запустить проект:

```bash
pnpm dev
```

Клиент по умолчанию: `http://localhost:5173`  
API по умолчанию: `http://localhost:3000/api`  
Swagger: `http://localhost:3000/api/docs`

## Полезные команды

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm seed
pnpm docker:up
pnpm docker:down
```

## Переменные окружения

Список переменных и значений по умолчанию находится в `.env.example`.
