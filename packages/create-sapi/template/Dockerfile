FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
RUN bun install --production

COPY . .

ENV PORT=3007
ENV BASE_URL=api
ENV DASHBOARD_TOKEN=changeme
ENV APP_DIR=/app

EXPOSE 3007

CMD ["node", "supervisor.mjs"]
