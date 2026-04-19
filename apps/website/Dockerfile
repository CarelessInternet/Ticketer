# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG BUN_MAJOR_VERSION=1
ARG TURBO_MAJOR_VERSION=2

FROM oven/bun:${BUN_MAJOR_VERSION}-alpine AS base
ENV NODE_ENV=production

# Require the dependencies which "@ticketer/website" depends on.
FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /src
RUN bun add --global turbo@${TURBO_MAJOR_VERSION}
COPY . .
RUN turbo prune @ticketer/website --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /src
RUN bun add --global turbo@${TURBO_MAJOR_VERSION}

# Install the dependencies.
COPY --from=builder /src/out/json/ .
COPY --from=builder /src/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile

# Build the project and its dependencies.
COPY --from=builder /src/out/full/ .
COPY turbo.json turbo.json

# Declare necessary environment variables for the build step.
ARG NEXT_PUBLIC_SITE_URL

RUN \
	if [ -z "$NEXT_PUBLIC_SITE_URL" ]; then \
		echo "ERROR: NEXT_PUBLIC_SITE_URL build-arg is required" >&2; \
		exit 1; \
	fi

ARG NEXT_PUBLIC_UMAMI_ID
ARG NEXT_PUBLIC_UMAMI_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBO_TELEMETRY_DISABLED=1
RUN turbo run build --filter=@ticketer/website

# Copy the files over and use the apps/website directory.
FROM base AS runner
RUN apk add --no-cache curl
WORKDIR /src
USER bun

# https://turborepo.com/docs/guides/tools/docker
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=bun:bun /src/apps/website/.next/standalone ./
COPY --from=installer --chown=bun:bun /src/apps/website/.next/static ./apps/website/.next/static
COPY --from=installer --chown=bun:bun /src/apps/website/public ./apps/website/public

ENV HOSTNAME=0.0.0.0
ENV PORT=2027
EXPOSE ${PORT}

# Run the website.
CMD ["bun", "run", "apps/website/server.js"]
