FROM node:18.8.0-alpine3.15 AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm i

COPY . .

ENV NODE_OPTIONS=--experimental-specifier-resolution=node
RUN echo ${NODE_OPTIONS}

RUN pnpm build

FROM node:18.8.0-alpine3.15

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/static ./static
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "build"]
