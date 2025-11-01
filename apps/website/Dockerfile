# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_MAJOR_VERSION=24
ARG PNPM_MAJOR_VERSION=10
ARG TURBO_MAJOR_VERSION=2

FROM node:${NODE_MAJOR_VERSION}-alpine AS installer
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_MAJOR_VERSION}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Require the dependencies which "@ticketer/website" depends on.
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /src
RUN pnpm add -g turbo@${TURBO_MAJOR_VERSION}
COPY . .
RUN turbo prune @ticketer/website --docker

# Install the dependencies.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Build the project and its dependencies.
RUN pnpm build

FROM nginx:1-alpine AS runner
COPY --from=installer /src/apps/website/out /usr/share/nginx/html
USER nginx
EXPOSE 80
