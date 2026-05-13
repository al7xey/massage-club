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
npm install
```

2. Создать `.env` из шаблона:

```bash
cp .env.example .env
```

3. Поднять PostgreSQL (опционально через Docker):

```bash
npm run docker:up
```

4. Запустить проект:

```bash
npm run dev
```

Клиент по умолчанию: `http://localhost:5173`  
API по умолчанию: `http://localhost:3000/api`  
Swagger: `http://localhost:3000/api/docs`

## Полезные команды

```bash
npm run dev
npm run build
npm run typecheck
npm run seed
npm run docker:up
npm run docker:down
```

## Переменные окружения

Список переменных и значений по умолчанию находится в `.env.example`.
