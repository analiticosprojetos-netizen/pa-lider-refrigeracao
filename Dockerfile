# Build Stage
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ .
# Copiando o build do frontend para servi-lo via Express
# Ajuste o caminho se sua pasta de build for diferente de 'dist'
COPY --from=build-stage /app/dist ./src/public

EXPOSE 80
ENV PORT=80
ENV NODE_ENV=production

CMD ["node", "server.js"]
