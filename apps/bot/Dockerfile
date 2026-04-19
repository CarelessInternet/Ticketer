# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG BUN_MAJOR_VERSION=1
ARG TURBO_MAJOR_VERSION=2

FROM oven/bun:${BUN_MAJOR_VERSION}-alpine AS base

# Require the dependencies which "@ticketer/bot" depends on.
FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /src
RUN bun add --global turbo@${TURBO_MAJOR_VERSION}
COPY . .
RUN turbo prune @ticketer/bot --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /src

# Install the dependencies.
COPY --from=builder /src/out/json/ .
COPY --from=builder /src/out/bun.lock ./bun.lock
RUN bun install --production --frozen-lockfile

# Build the project and its dependencies.
COPY --from=builder /src/out/full/ .
COPY turbo.json turbo.json

# Copy the files over and use the apps/bot directory.
FROM base AS runner
WORKDIR /src
USER bun
COPY --from=installer /src .
WORKDIR /src/apps/bot

# Run the bot.
CMD ["bun", "start"]
