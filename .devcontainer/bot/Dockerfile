# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_MAJOR_VERSION=24
# Necessary to run "pnpm install" when the Dev Container has started.
ARG PNPM_MAJOR_VERSION=10

FROM node:${NODE_MAJOR_VERSION}-alpine as base
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_MAJOR_VERSION}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# https://code.visualstudio.com/remote/advancedcontainers/sharing-git-credentials#_sharing-gpg-keys
RUN apk add --no-cache bash bash-completion git gnupg gcompat

RUN git config --global --add safe.directory /workspaces/Ticketer

# https://askubuntu.com/a/453580
# Makes the terminal use a colourful username, hostname, and directory.
RUN echo "PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '" >> /root/.bashrc
USER root
