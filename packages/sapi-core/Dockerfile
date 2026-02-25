FROM oven/bun:1-alpine

WORKDIR /sapi

# 复制核心依赖
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 复制核心源码
COPY src/ ./src/

# 用户业务代码挂载点（运行时挂载）
VOLUME ["/app"]

ENV PORT=3007
ENV BASE_URL=api
ENV DASHBOARD_TOKEN=changeme
ENV APP_DIR=/app

EXPOSE 3007

CMD ["bun", "run", "src/index.ts"]
