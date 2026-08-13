FROM ghcr.io/pnpm/pnpm:11
RUN pnpm runtime set node 24 -g
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
CMD ["pnpm", "start"]