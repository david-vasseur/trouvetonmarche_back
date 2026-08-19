# Stage 1 : builder
FROM node:22.21.0-bookworm-slim AS builder

WORKDIR /usr/src/app
RUN apt-get update -y && apt-get install -y openssl

# Installer dépendances
COPY package*.json ./
RUN npm ci

# Copier tout le projet (inclut déjà les configs et prisma)
COPY . .

# Générer les clients Prisma
RUN npx prisma generate --config='./prisma.config.ts'


# Build NestJS
RUN npm run build

# Stage 2 : runner
FROM node:22.21.0-bookworm-slim AS runner

WORKDIR /usr/src/app
RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev


# Copier le build
COPY --from=builder /usr/src/app/dist ./dist

# Copier les fichiers Prisma nécessaires au CLI (migrations)
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.ts ./


# Copier les clients générés
COPY --from=builder /usr/src/app/lib/generated ./lib/generated

# Mode rootless
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/sh trouvetonmarche-back

RUN chown -R trouvetonmarche-back:nodejs /usr/src/app

USER trouvetonmarche-back

# Lancement de l'app
CMD ["node", "dist/src/main.js"]
