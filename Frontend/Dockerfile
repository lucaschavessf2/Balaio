FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci


FROM node:22-alpine AS api-deps

WORKDIR /api

COPY package.json /tmp/package.json
RUN npm init -y >/dev/null \
  && npm install --no-audit --no-fund \
    "json-server@$(node -p "require('/tmp/package.json').devDependencies['json-server']")"


FROM node:22-alpine AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV API_URL=http://127.0.0.1:3001/api/v1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=7879
ENV HOSTNAME=0.0.0.0
ENV FAKE_API_PORT=3001
ENV API_URL=http://127.0.0.1:3001/api/v1

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/fake-api ./fake-api
COPY --from=api-deps --chown=nextjs:nodejs /api/node_modules ./fake-api/node_modules
COPY --from=build --chown=nextjs:nodejs /app/scripts/iniciar-producao.cjs ./iniciar-producao.cjs

USER nextjs

EXPOSE 7879

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1:7879/healthz \
   && wget -q -O /dev/null http://127.0.0.1:7879/api/v1/referencias \
   || exit 1

CMD ["node", "iniciar-producao.cjs"]
