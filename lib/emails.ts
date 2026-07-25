import { formatoCOP, NEGOCIO } from '@/lib/mock-data'

/* ─────────────────────────────────────────────────────────────────
   Plantillas de correo (HTML compatible con Gmail / Apple Mail /
   Outlook): layout por tablas + estilos inline. Estética "Don Antonio":
   negro carbón, latón dorado y marfil.
   ───────────────────────────────────────────────────────────────── */

export interface ReservaEmailData {
  codigo: string
  nombre: string
  email: string
  celular: string
  servicios: { nombre: string; precio: number; duracion: number }[]
  total: number
  duracionTotal: number
  fecha: string // "Mié 01"
  hora: string // "10:30"
}

const ORO = '#c9a24b'
const ORO_CLARO = '#e0be6a'
const NEGRO = '#0f0f0f'
const CARBON = '#1a1814'
const CARBON2 = '#232019'
const MARFIL = '#f2eee6'
const TENUE = '#a9a396'
const BORDE = '#3a352b'

/** Normaliza un celular colombiano a formato wa.me (57XXXXXXXXXX). */
export function waLink(celular: string): string {
  const d = celular.replace(/\D/g, '')
  const con = d.startsWith('57') ? d : `57${d}`
  return `https://wa.me/${con}`
}

function filasServicios(servicios: ReservaEmailData['servicios']): string {
  return servicios
    .map(
      (s) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDE};color:${MARFIL};font-size:15px;">
          ${escapar(s.nombre)}
          <span style="color:${TENUE};font-size:13px;"> · ${s.duracion} min</span>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid ${BORDE};color:${MARFIL};font-size:15px;white-space:nowrap;">
          ${formatoCOP(s.precio)}
        </td>
      </tr>`,
    )
    .join('')
}

/** Tarjeta tipo "ticket" con el detalle de la reserva. */
function ticket(d: ReservaEmailData): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CARBON};border:1px solid ${BORDE};border-radius:16px;">
    <tr><td style="padding:24px 24px 8px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-family:Georgia,'Times New Roman',serif;font-style:italic;color:${ORO_CLARO};font-size:22px;">
            ${NEGOCIO.nombre}
          </td>
          <td align="right">
            <span style="display:inline-block;background:rgba(201,162,75,0.14);color:${ORO_CLARO};font-weight:700;font-size:13px;letter-spacing:1px;padding:6px 12px;border-radius:999px;">
              ${escapar(d.codigo)}
            </span>
          </td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:8px 24px 0 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${filasServicios(d.servicios)}
      </table>
    </td></tr>
    <tr><td style="padding:16px 24px 24px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:${TENUE};font-size:14px;">
            ${escapar(d.fecha)} · ${escapar(d.hora)} · ${d.duracionTotal} min
          </td>
          <td align="right" style="color:${ORO_CLARO};font-size:20px;font-weight:700;font-family:Georgia,serif;white-space:nowrap;">
            ${formatoCOP(d.total)}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>`
}

/** Botón "bulletproof" (compatible con Outlook). */
function boton(href: string, texto: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr><td align="center" style="border-radius:999px;background:${ORO};">
      <a href="${href}" target="_blank"
         style="display:inline-block;padding:14px 30px;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:${NEGRO};text-decoration:none;border-radius:999px;">
        ${texto}
      </a>
    </td></tr>
  </table>`
}

/** Envoltorio común: barra dorada, fondo oscuro, pie con datos. */
function shell(opts: {
  preheader: string
  contenido: string
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark light">
  <title>${NEGOCIO.nombre}</title>
</head>
<body style="margin:0;padding:0;background:${NEGRO};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${NEGRO};">${escapar(
    opts.preheader,
  )}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NEGRO};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;">
        <!-- barra superior dorada -->
        <tr><td style="height:4px;background:linear-gradient(90deg,${'#8c6b2e'},${ORO_CLARO},${'#8c6b2e'});border-radius:4px 4px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="background:${CARBON2};border:1px solid ${BORDE};border-top:none;border-radius:0 0 18px 18px;padding:32px 28px;">
          <!-- Encabezado de marca con logo -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding-bottom:26px;">
              <img src="cid:logoDA" width="62" height="62" alt="${NEGOCIO.nombre}"
                   style="display:block;margin:0 auto;border-radius:50%;border:1px solid ${BORDE};" />
              <div style="font-family:Helvetica,Arial,sans-serif;letter-spacing:5px;font-size:13px;font-weight:700;color:${MARFIL};margin-top:12px;">
                DON ANTONIO
              </div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;color:${ORO_CLARO};font-size:14px;margin-top:3px;">
                Barbería · Quinchía
              </div>
              <div style="height:1px;width:46px;margin:16px auto 0;background:${ORO};opacity:0.6;"></div>
            </td></tr>
          </table>
          ${opts.contenido}
        </td></tr>
        <!-- pie -->
        <tr><td style="padding:22px 12px;color:${TENUE};font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;text-align:center;">
          <strong style="color:${MARFIL};">${NEGOCIO.nombre}</strong> · ${escapar(
            NEGOCIO.direccion,
          )}<br>
          ${escapar(NEGOCIO.horario)} · ${escapar(NEGOCIO.telefono)}<br>
          <span style="color:#6f6a5e;">Este correo se generó automáticamente al reservar en línea.</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function escapar(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/* ── Correo 1 · CLIENTE (confirmación) ──────────────────────────── */
export function emailCliente(d: ReservaEmailData) {
  const primerNombre = d.nombre.trim().split(' ')[0] || 'crack'
  const contenido = `
    <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${ORO_CLARO};">
      Reserva confirmada
    </p>
    <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-size:28px;line-height:1.2;color:${MARFIL};">
      ¡Listo, ${escapar(primerNombre)}! 💈
    </h1>
    <p style="margin:0 0 26px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${TENUE};">
      Tu cita en <strong style="color:${MARFIL};">${NEGOCIO.nombre}</strong> quedó agendada.
      Te esperamos el <strong style="color:${MARFIL};">${escapar(d.fecha)}</strong> a las
      <strong style="color:${MARFIL};">${escapar(d.hora)}</strong>. Guarda tu código
      <strong style="color:${ORO_CLARO};">${escapar(d.codigo)}</strong>.
    </p>
    ${ticket(d)}
    <div style="height:28px;"></div>
    ${boton(
      `${waLink(NEGOCIO.whatsapp)}?text=${encodeURIComponent(
        `Hola, soy ${d.nombre}. Confirmo mi cita ${d.codigo} para ${d.fecha} a las ${d.hora}.`,
      )}`,
      'Confirmar por WhatsApp',
    )}
    <p style="margin:28px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.6;color:${MARFIL};text-align:center;">
      Gracias por preferir a <strong style="color:${ORO_CLARO};">${NEGOCIO.nombre}</strong>. 🙌
    </p>
    <p style="margin:8px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:${TENUE};text-align:center;">
      ¿Necesitas mover la cita? Respóndenos o escríbenos por WhatsApp.<br>
      Estamos en <strong style="color:${MARFIL};">${escapar(NEGOCIO.direccion)}</strong>.
    </p>`

  const text = `Reserva confirmada · ${NEGOCIO.nombre}
¡Listo, ${primerNombre}! Tu cita quedó agendada.
Código: ${d.codigo}
Cuándo: ${d.fecha} a las ${d.hora} (${d.duracionTotal} min)
Servicios:
${d.servicios.map((s) => ` - ${s.nombre} · ${s.duracion} min · ${formatoCOP(s.precio)}`).join('\n')}
Total: ${formatoCOP(d.total)}
Dónde: ${NEGOCIO.direccion}
WhatsApp: ${waLink(NEGOCIO.whatsapp)}`

  return {
    subject: `✅ Tu cita en ${NEGOCIO.nombre} · ${d.fecha} ${d.hora} (${d.codigo})`,
    html: shell({
      preheader: `Cita confirmada para el ${d.fecha} a las ${d.hora}. Código ${d.codigo}.`,
      contenido,
    }),
    text,
  }
}

/* ── Correo 2 · BARBERO (Sergio) ────────────────────────────────── */
export function emailBarbero(d: ReservaEmailData) {
  const wa = waLink(d.celular)
  const tel = `tel:${d.celular.replace(/[^\d+]/g, '')}`
  const contenido = `
    <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${ORO_CLARO};">
      Nueva reserva
    </p>
    <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-size:26px;line-height:1.2;color:${MARFIL};">
      ${escapar(d.fecha)} · ${escapar(d.hora)}
    </h1>
    <p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${TENUE};">
      ${escapar(NEGOCIO.barbero)}, tienes una cita nueva de
      <strong style="color:${MARFIL};">${escapar(d.nombre)}</strong>.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CARBON};border:1px solid ${BORDE};border-radius:14px;margin:0 0 22px;">
      <tr><td style="padding:18px 20px;font-family:Helvetica,Arial,sans-serif;">
        <p style="margin:0 0 4px;color:${TENUE};font-size:12px;text-transform:uppercase;letter-spacing:1px;">Cliente</p>
        <p style="margin:0 0 14px;color:${MARFIL};font-size:18px;font-weight:700;">${escapar(
          d.nombre,
        )}</p>
        <p style="margin:0;color:${MARFIL};font-size:15px;line-height:1.9;">
          📱 <a href="${tel}" style="color:${ORO_CLARO};text-decoration:none;">${escapar(
            d.celular,
          )}</a>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          ✉️ <a href="mailto:${escapar(d.email)}" style="color:${ORO_CLARO};text-decoration:none;">${escapar(
            d.email,
          )}</a>
        </p>
      </td></tr>
    </table>

    ${ticket(d)}
    <div style="height:26px;"></div>
    ${boton(
      `${wa}?text=${encodeURIComponent(
        `Hola ${d.nombre.split(' ')[0]}, te confirmo tu cita ${d.codigo} en ${NEGOCIO.nombre} para el ${d.fecha} a las ${d.hora}. ¡Te esperamos!`,
      )}`,
      'Escribir al cliente por WhatsApp',
    )}
    <p style="margin:22px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:${TENUE};text-align:center;">
      Código de la reserva: <strong style="color:${ORO_CLARO};">${escapar(d.codigo)}</strong>
    </p>`

  const text = `Nueva reserva · ${NEGOCIO.nombre}
${d.fecha} a las ${d.hora} (${d.duracionTotal} min)
Cliente: ${d.nombre}
Tel: ${d.celular}  |  Email: ${d.email}
Servicios:
${d.servicios.map((s) => ` - ${s.nombre} · ${s.duracion} min · ${formatoCOP(s.precio)}`).join('\n')}
Total: ${formatoCOP(d.total)}
Código: ${d.codigo}
WhatsApp cliente: ${wa}`

  return {
    subject: `💈 Nueva cita: ${d.nombre} · ${d.fecha} ${d.hora}`,
    html: shell({
      preheader: `${d.nombre} reservó para el ${d.fecha} a las ${d.hora}.`,
      contenido,
    }),
    text,
  }
}
