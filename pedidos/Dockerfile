FROM node:22-alpine AS build
WORKDIR /service
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /service
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY --from=build /service/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
