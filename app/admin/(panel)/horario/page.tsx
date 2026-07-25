import { Clock, Save } from 'lucide-react'
import { getHorario } from '@/lib/repo'
import { guardarHorario } from '@/app/admin/actions'

export const dynamic = 'force-dynamic'

const DIAS = [
  { n: 1, label: 'Lunes' },
  { n: 2, label: 'Martes' },
  { n: 3, label: 'Miércoles' },
  { n: 4, label: 'Jueves' },
  { n: 5, label: 'Viernes' },
  { n: 6, label: 'Sábado' },
  { n: 0, label: 'Domingo' },
]

const horaLabel = (h: number) => `${String(h).padStart(2, '0')}:00`

export default async function HorarioPage() {
  const horario = await getHorario()
  const aperturas = Array.from({ length: 8 }, (_, i) => 6 + i) // 6..13
  const cierres = Array.from({ length: 9 }, (_, i) => 14 + i) // 14..22

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-marfil">
          <Clock className="h-5 w-5 text-laton-claro" />
          Mi jornada
        </h1>
        <p className="text-sm text-marfil-tenue">
          Define tu horario y tus días libres. El sitio de reservas solo ofrece
          citas dentro de esta jornada.
        </p>
      </header>

      <form action={guardarHorario} className="space-y-6 rounded-xl border border-border bg-card p-5">
        {/* Horas de atención */}
        <div>
          <p className="mb-2 text-sm font-semibold text-marfil">Horas de atención</p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-marfil-tenue">Abre</span>
              <select
                name="apertura"
                defaultValue={horario.apertura}
                className="rounded-lg border border-border bg-negro-base px-3 py-2 text-sm text-marfil outline-none focus:border-laton"
              >
                {aperturas.map((h) => (
                  <option key={h} value={h}>
                    {horaLabel(h)}
                  </option>
                ))}
              </select>
            </label>
            <span className="pb-2 text-marfil-tenue">→</span>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-marfil-tenue">Cierra</span>
              <select
                name="cierre"
                defaultValue={horario.cierre}
                className="rounded-lg border border-border bg-negro-base px-3 py-2 text-sm text-marfil outline-none focus:border-laton"
              >
                {cierres.map((h) => (
                  <option key={h} value={h}>
                    {horaLabel(h)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Días cerrados */}
        <div>
          <p className="mb-2 text-sm font-semibold text-marfil">Días que NO atiendes</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DIAS.map((d) => {
              const cerrado = horario.diasCerrados.includes(d.n)
              return (
                <label
                  key={d.n}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-negro-base px-3 py-2.5 text-sm text-marfil"
                >
                  <input
                    type="checkbox"
                    name={`dia-${d.n}`}
                    defaultChecked={cerrado}
                    className="h-4 w-4 accent-[var(--laton)]"
                  />
                  {d.label}
                </label>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-marfil-tenue">
            Marca los días que la barbería está cerrada. Esos días no aparecen
            para reservar.
          </p>
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-laton px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="h-4 w-4" />
            Guardar jornada
          </button>
        </div>
      </form>
    </div>
  )
}
