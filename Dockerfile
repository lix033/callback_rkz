# Image légère et sécurisée
FROM node:20-alpine

# Crée un user non-root
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Install deps séparément pour le cache
COPY package*.json ./
RUN npm ci --only=production

# Copie du code
COPY src ./src

# Crée le dossier logs et donne les droits
RUN mkdir -p /app/logs && chown -R app:app /app

USER app
ENV NODE_ENV=production
EXPOSE 3000

# Healthcheck simple
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
