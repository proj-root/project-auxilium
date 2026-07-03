FROM node:20-alpine
WORKDIR /app

COPY package*.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY server ./server/

RUN npm ci

# Build
RUN npm run build --workspace=@auxilium/configs --workspace=@auxilium/types
RUN npm run build --workspace=server

EXPOSE 5175

CMD ["node", "server/dist/src/main"]