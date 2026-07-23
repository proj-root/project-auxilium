FROM node:20-alpine
WORKDIR /app

COPY package*.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY server ./server/

RUN npm ci
RUN npm i -D tsx

# Build
RUN npm run build --workspace=@auxilium/configs --workspace=@auxilium/types
RUN npm run build --workspace=server

EXPOSE 5175

RUN npm run db:deploy --workspace=server
RUN npm run seed:prod --workspace=server

# Copy and set entrypoint
COPY ./server/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server/dist/src/main"]
# CMD ["npm", "run", "start:prod", "--workspace=server"]