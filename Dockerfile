# ─────────────────────────────────────────────────────────────
# Don Antonio · Barbería — imagen para Dokploy / Contabo
# Next.js 16 + Prisma + SQLite (base de datos en volumen persistente)
# ─────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    # La base de datos vive en el volumen /app/data (persiste entre despliegues).
    DATABASE_URL="file:/app/data/dev.db"

WORKDIR /app

# pnpm (misma versión que en desarrollo)
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

# 1) Dependencias (incluye dev: prisma, tsx y el build las necesitan)
COPY package.json pnpm-lock.yaml* .npmrc* ./
RUN pnpm install --no-frozen-lockfile --prod=false

# 2) Código + generación de Prisma + build de Next
COPY . .
RUN pnpm prisma generate && pnpm build

# 3) Carpeta de datos (punto de montaje del volumen)
RUN mkdir -p /app/data

EXPOSE 3000

# Al arrancar el contenedor:
#   · aplica migraciones a la BD del volumen
#   · siembra datos demo (re-ancla las citas de ejemplo al día de hoy;
#     NO borra las reservas reales del sitio, que usan prefijo DA-)
#   · levanta el servidor
CMD ["sh", "-lc", "pnpm prisma migrate deploy && pnpm exec tsx prisma/seed.ts && pnpm exec next start -p ${PORT:-3000} -H 0.0.0.0"]
