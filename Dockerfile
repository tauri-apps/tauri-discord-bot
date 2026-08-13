FROM ghcr.io/pnpm/pnpm:11
RUN pnpm runtime set node 24 -g
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --prod
CMD ["pnpm", "start"]

# This Dockerfile is used in production, it is not a development environment.