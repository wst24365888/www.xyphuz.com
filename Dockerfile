FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json package.json
COPY bun.lockb bun.lockb

RUN ls -lh

RUN bun i --frozen-lockfile

COPY . .

RUN bun run build

FROM oven/bun:latest

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/static ./static
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["bun", "./build/index.js"]
