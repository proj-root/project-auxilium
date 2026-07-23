# FROM node:20-alpine AS development-dependencies-env
# WORKDIR /app
# COPY package.json package-lock.json ./
# COPY packages/ ./packages/
# COPY client/ ./client/
# RUN npm ci

# FROM node:20-alpine AS production-dependencies-env
# COPY ./package.json package-lock.json /app/
# WORKDIR /app
# RUN npm ci --omit=dev

# FROM node:20-alpine AS build-env
# WORKDIR /app

# COPY package.json package-lock.json ./
# COPY packages/ ./packages/
# COPY client/ ./client/
# COPY --from=development-dependencies-env node_modules/ ./node_modules

# ARG VITE_API_BASE_URL
# ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# RUN npm run build --workspace=client

# FROM node:20-alpine
# COPY ./package.json package-lock.json /app/
# COPY --from=production-dependencies-env /app/node_modules /app/node_modules
# COPY --from=build-env /app/client/build /app/build
# WORKDIR /app
# ENV PORT=5173
# CMD ["npm", "run", "start"]

FROM node:20-alpine
WORKDIR /app

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY client/ ./client/

RUN npm ci
RUN npm run build --workspace=@auxilium/configs --workspace=@auxilium/types
RUN npm run build -w client

WORKDIR /app/client

ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "start"]