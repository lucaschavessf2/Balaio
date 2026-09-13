FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci


FROM node:22-alpine AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=7879
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 7879

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:7879/healthz || exit 1

CMD ["node", "server.js"]
