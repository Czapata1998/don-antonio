export type Categoria = 'Cortes' | 'Barba' | 'Cejas' | 'Diseños'

export interface Servicio {
  id: string
  categoria: Categoria
  nombre: string
  descripcion: string
  precio: number
  duracion: number // minutos
}

export const SERVICIOS: Servicio[] = [
  {
    id: 'corte-clasico',
    categoria: 'Cortes',
    nombre: 'Corte clásico',
    descripcion: 'Tijera y máquina, terminado a tu medida.',
    precio: 18000,
    duracion: 30,
  },
  {
    id: 'corte-lavado',
    categoria: 'Cortes',
    nombre: 'Corte + lavado',
    descripcion: 'Corte completo con lavado y secado.',
    precio: 25000,
    duracion: 60,
  },
  {
    id: 'perfilado-barba',
    categoria: 'Barba',
    nombre: 'Perfilado de barba',
    descripcion: 'Definición de líneas y arreglo prolijo.',
    precio: 12000,
    duracion: 30,
  },
  {
    id: 'afeitado-navaja',
    categoria: 'Barba',
    nombre: 'Afeitado a navaja',
    descripcion: 'Toalla caliente y apurado al ras, a la vieja escuela.',
    precio: 20000,
    duracion: 30,
  },
  {
    id: 'perfilado-cejas',
    categoria: 'Cejas',
    nombre: 'Perfilado de cejas',
    descripcion: 'Limpieza y forma para enmarcar la mirada.',
    precio: 8000,
    duracion: 30,
  },
  {
    id: 'diseno-decoracion',
    categoria: 'Diseños',
    nombre: 'Diseño / decoración',
    descripcion: 'Líneas, figuras y detalles personalizados. Toma su tiempo.',
    precio: 15000,
    duracion: 60,
  },
]

export const formatoCOP = (valor: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor)

export interface DiaDisponible {
  id: string
  etiqueta: string // "Hoy", "Mañana"
  diaSemana: string
  numero: string
  fecha: string // ISO local yyyy-mm-dd (ancla la reserva a un día real)
}

const NOMBRE_DIA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// Horario de atención POR DEFECTO (el barbero lo puede cambiar desde /admin;
// se guarda en la BD y este objeto solo sirve de respaldo).
// pasoMin = 30 → turnos limpios cada media hora (9:00, 9:30, 10:00…).
// Con duraciones múltiplos de 30, las citas nunca se solapan.
export const HORARIO = { apertura: 9, cierre: 18, pasoMin: 30 } as const
// Días cerrados por defecto (0 = domingo).
export const DIAS_CERRADOS_DEFAULT = [0]

// Fecha local en formato yyyy-mm-dd (sin corrimiento de zona horaria).
export function fechaISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Grilla de horas "HH:MM" entre apertura y cierre (sin estado de ocupación).
export function gridHoras(
  apertura: number = HORARIO.apertura,
  cierre: number = HORARIO.cierre,
  paso: number = HORARIO.pasoMin,
): string[] {
  const horas: string[] = []
  for (let h = apertura; h < cierre; h++) {
    for (let m = 0; m < 60; m += paso) {
      horas.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return horas
}

// Genera los próximos `cantidad` días abiertos desde hoy, saltando los
// días cerrados. Ids estables d0..dN y una fecha ISO real por día.
export function construirDias(
  diasCerrados: number[] = DIAS_CERRADOS_DEFAULT,
  cantidad = 6,
): DiaDisponible[] {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const manana = new Date(hoy)
  manana.setDate(hoy.getDate() + 1)

  const dias: DiaDisponible[] = []
  const cursor = new Date(hoy)
  let guarda = 0
  while (dias.length < cantidad && guarda < 60) {
    guarda++
    if (!diasCerrados.includes(cursor.getDay())) {
      const esHoy = cursor.getTime() === hoy.getTime()
      const esManiana = cursor.getTime() === manana.getTime()
      dias.push({
        id: `d${dias.length}`,
        etiqueta: esHoy ? 'Hoy' : esManiana ? 'Mañana' : NOMBRE_DIA[cursor.getDay()],
        diaSemana: NOMBRE_DIA[cursor.getDay()],
        numero: String(cursor.getDate()).padStart(2, '0'),
        fecha: fechaISO(cursor),
      })
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return dias
}

export const DIAS: DiaDisponible[] = construirDias()

export interface Slot {
  hora: string
  ocupado: boolean
}

export interface DatosReserva {
  nombre: string
  celular: string
  email: string
}

// Carga útil que viaja del formulario al servidor.
export interface ReservaPayload {
  servicios: Servicio[]
  diaId: string
  hora: string
  datos: DatosReserva
}

// Resultado que devuelve la acción de servidor al cliente.
export interface ReservaResultado {
  ok: boolean
  codigo?: string
  /** true si los correos se enviaron de verdad; false si fue modo simulado */
  enviado?: boolean
  /** correos que el servidor aceptó entregar */
  entregados?: string[]
  /** true si el SMS al barbero se envió de verdad */
  sms?: boolean
  error?: string
}

// Número de WhatsApp del negocio (placeholder).
export const WHATSAPP = '573000000000'

// ── Datos del negocio (se usan en la web y en los correos) ──────────
export const NEGOCIO = {
  nombre: 'Don Antonio',
  eslogan: 'Barbería · Tu estilo, en buenas manos.',
  barbero: 'Sergio',
  direccion: 'Quinchía, Risaralda, Colombia',
  horario: 'Lun a Sáb · 9:00 a 18:00',
  telefono: '+57 300 000 0000',
  whatsapp: WHATSAPP,
  // Marca (para los correos HTML)
  colorPrimario: '#c9a24b',
  colorPrimarioClaro: '#e0be6a',
  colorFondo: '#0f0f0f',
  colorCarbon: '#1a1814',
  colorMarfil: '#f2eee6',
} as const
