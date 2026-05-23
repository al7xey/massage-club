FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/server/package*.json apps/server/
COPY apps/client/package*.json apps/client/
COPY packages/shared/package*.json packages/shared/
RUN npm ci

FROM deps AS build
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY . .
RUN npm run build --workspace client

FROM nginx:1.27-alpine AS runtime
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/client/dist /usr/share/nginx/html
EXPOSE 80
