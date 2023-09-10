FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json package.json
COPY bun.lockb bun.lockb

RUN bun i --frozen-lockfile --verbose

COPY . .

ENV NODE_ENV=production

RUN bun run build

FROM oven/bun:latest

WORKDIR /app

COPY --from=builder /app/build /app
# COPY --from=builder /app/bun.lockb ./

# RUN bun i --prod --frozen-lockfile --verbose
RUN bun i --prod --verbose

EXPOSE 3000

CMD ["bun", "start"]
