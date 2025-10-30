# Dockerfile — backend (producción)
FROM node:18-alpine

# crear usuario no-root
RUN addgroup -S app && adduser -S -G app app

WORKDIR /app

# copiar package.json primero para usar cache de docker
COPY package*.json ./

# instalar dependencias en modo producción
RUN npm ci --production

# copiar el resto del código
COPY . .

# cambiar propietario y usar usuario no-root
RUN chown -R app:app /app
USER app

ENV NODE_ENV=production
ENV PORT=4567

EXPOSE 4567

# Comando de arranque
CMD ["node", "server.js"]


