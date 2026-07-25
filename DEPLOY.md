# Desplegar en Dokploy (Contabo) — Don Antonio

Guía paso a paso. El proyecto se despliega como **una sola app** que sirve:

- El **sitio público** en tu dominio raíz → `https://donantonio.tudominio.com`
- El **panel del barbero** en el subdominio admin → `https://admin.tudominio.com`
  (el ruteo por subdominio ya está resuelto en `proxy.ts`; también funciona en
  `.../admin` del dominio principal).

> No puedo ejecutar el despliegue por ti (no tengo acceso a tu Contabo/Dokploy),
> pero dejé **todo listo**: `Dockerfile`, `.dockerignore`, variables y este instructivo.

---

## 1. Subir el código

Sube el proyecto a un repo de Git (GitHub/GitLab) o usa la opción de Dokploy de
build por Dockerfile desde un repositorio. Dokploy necesita ver el `Dockerfile`
de la raíz.

## 2. Crear la aplicación en Dokploy

1. **Create → Application**.
2. **Source**: tu repositorio (rama `main`).
3. **Build Type**: **Dockerfile** (está en la raíz, Dokploy lo detecta).
4. **Port**: `3000`.

## 3. Volumen para la base de datos (IMPORTANTE)

SQLite guarda todo en un archivo; sin volumen, los datos se borran en cada
despliegue. En la app → **Advanced → Volumes / Mounts**:

- **Mount Path (dentro del contenedor)**: `/app/data`
- Tipo: **Volume** (named volume) — nombre p.ej. `donantonio-data`.

## 4. Variables de entorno

En la app → **Environment**, pega lo de `.env.production.example` y ajusta:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | `file:/app/data/dev.db` (no cambiar) |
| `ADMIN_PASSWORD` | la clave del barbero para entrar a `/admin` |
| `ADMIN_SESSION_SECRET` | cadena larga aleatoria (32+ caracteres) |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` / `BARBER_EMAIL` | para los correos (ver §7) |

> Genera el secreto con: `openssl rand -hex 32`

## 5. Dominios y subdominios

En Dokploy → app → **Domains**, agrega **dos** dominios apuntando a la MISMA app
(puerto 3000), ambos con **HTTPS/Let's Encrypt** activado:

1. `donantonio.tudominio.com` → sitio público.
2. `admin.tudominio.com` → panel (el `proxy.ts` lo enruta solo).

En tu proveedor de **DNS** crea dos registros **A** (o CNAME) apuntando a la IP
de tu VPS Contabo:

```
donantonio   A   <IP-de-tu-Contabo>
admin        A   <IP-de-tu-Contabo>
```

## 6. Desplegar

Pulsa **Deploy**. El contenedor, al arrancar, automáticamente:

1. aplica las migraciones a la BD del volumen,
2. siembra datos demo (re-ancla las citas de ejemplo al día de hoy; **no borra**
   las reservas reales),
3. levanta el servidor.

Cuando termine:

- Sitio: `https://donantonio.tudominio.com`
- Panel: `https://admin.tudominio.com` → contraseña = tu `ADMIN_PASSWORD`.

## 7. Correos de confirmación (con logo)

Los correos salen por **Gmail + App Password**:

1. Activa **verificación en 2 pasos** en la cuenta de Gmail.
2. Crea una **App Password** en https://myaccount.google.com/apppasswords
3. Pon `GMAIL_USER`, `GMAIL_APP_PASSWORD` y `BARBER_EMAIL` en Environment y
   redeploy.

Con eso, cada reserva envía al cliente un correo estilizado (logo, servicio,
hora, total y agradecimiento) y un aviso al barbero.

---

## Notas

- **Tiempo real**: el panel se auto-refresca cada 25 s (y al volver a la
  pestaña), así las reservas nuevas del sitio aparecen solas.
- **Datos demo**: se re-siembran en cada arranque para que la agenda siempre se
  vea viva. Las reservas reales (código `DA-####`) se conservan.
- **Producción más robusta**: para mucho tráfico conviene migrar de SQLite a
  Postgres (Dokploy tiene plugin de Postgres). Hoy SQLite en volumen es
  suficiente para una barbería.
