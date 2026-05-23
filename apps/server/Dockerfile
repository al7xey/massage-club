FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/server/package*.json apps/server/
COPY apps/client/package*.json apps/client/
COPY packages/shared/package*.json packages/shared/
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build --workspace @massage/shared && npm run build --workspace server

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/apps/server/package*.json ./apps/server/
COPY --from=build /app/apps/server/dist ./apps/server/dist
USER node
WORKDIR /app/apps/server
EXPOSE 3000
CMD ["node", "dist/main.js"]
