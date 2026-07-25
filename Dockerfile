# ─────────────────────────────────────────────────────────────
# Don Antonio · Barbería — imagen para Dokploy / Contabo
# Next.js 16 + Prisma + SQLite (base de datos en volumen persistente)
# Usa npm (robusto en CI: corre los build scripts sin aprobación manual).
# ─────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim

ENV NEXT_TELEMETRY_DISABLED=1 \
    # La base de datos vive en el volumen /app/data (persiste entre despliegues).
    DATABASE_URL="file:/app/data/dev.db"

WORKDIR /app

# 1) Dependencias (dev incluidas: prisma, tsx y el build las necesitan).
#    Se copia el schema antes de instalar porque el postinstall corre
#    `prisma generate` y necesita ./prisma/schema.prisma.
COPY package.json ./
COPY prisma ./prisma
RUN npm install --include=dev --no-audit --no-fund --loglevel=error

# 2) Código + generación de Prisma + build de Next
COPY . .
RUN npx prisma generate && npm run build

# 3) Carpeta de datos (punto de montaje del volumen)
RUN mkdir -p /app/data

EXPOSE 3000

# Al arrancar el contenedor:
#   · aplica migraciones a la BD del volumen
#   · siembra datos demo (re-ancla las citas al día de hoy; conserva las reales)
#   · levanta el servidor
CMD ["sh", "-lc", "export NODE_ENV=production; export ADMIN_SESSION_SECRET=${ADMIN_SESSION_SECRET:-$(head -c32 /dev/urandom | od -An -tx1 | tr -d ' \\n')}; npx prisma migrate deploy && npx tsx prisma/seed.ts && npx next start -p ${PORT:-3000} -H 0.0.0.0"]
