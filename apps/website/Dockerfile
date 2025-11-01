# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_MAJOR_VERSION=24
ARG PNPM_MAJOR_VERSION=10
ARG TURBO_MAJOR_VERSION=2

FROM node:${NODE_MAJOR_VERSION}-alpine AS base
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_MAJOR_VERSION}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Require the dependencies which "@ticketer/website" depends on.
FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /src
RUN pnpm add -g turbo@${TURBO_MAJOR_VERSION}
COPY . .
RUN turbo prune @ticketer/website --docker

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
RUN pnpm build

FROM nginx:1-alpine AS runner
COPY --from=installer /src/apps/website/out /usr/share/nginx/html
USER nginx
EXPOSE 80
