# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

# This problem has caused pain: https://github.com/pnpm/pnpm/issues/6088
# The solution? Do not use dependenciesMeta.injected (until further notice).

ARG NODE_MAJOR_VERSION=22
ARG PNPM_MAJOR_VERSION=9
ARG TURBO_MAJOR_VERSION=1

FROM node:${NODE_MAJOR_VERSION}-alpine as base
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_MAJOR_VERSION}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Require the dependencies which "@ticketer/bot" depends on.
FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /src
RUN pnpm add -g turbo@${TURBO_MAJOR_VERSION}
COPY . .
RUN turbo prune @ticketer/bot --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /src

# Install the dependencies.
COPY --from=builder /src/out/json/ .
COPY --from=builder /src/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

# Build the project and its dependencies.
COPY --from=builder /src/out/full/ .
COPY turbo.json turbo.json

# Copy the files over and use the apps/bot directory.
FROM base AS runner
WORKDIR /src
USER node
COPY --from=installer /src .
WORKDIR /src/apps/bot

# Run the bot.
CMD ["pnpm", "start"]
