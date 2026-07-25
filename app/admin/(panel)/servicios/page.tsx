import { Plus, Save } from 'lucide-react'
import { getTodosLosServicios } from '@/lib/repo'
import { guardarServicio } from '@/app/admin/actions'

export const dynamic = 'force-dynamic'

const CATEGORIAS = ['Cortes', 'Barba', 'Cejas', 'Diseños']

const inputCls =
  'w-full rounded-lg border border-border bg-negro-base px-3 py-2 text-sm text-marfil outline-none placeholder:text-marfil-tenue/60 focus:border-laton'

function CampoLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-marfil-tenue">{children}</span>
}

type ServicioBD = Awaited<ReturnType<typeof getTodosLosServicios>>[number]

function ServicioForm({ s, orden }: { s?: ServicioBD; orden: number }) {
  const nuevo = !s
  return (
    <form
      action={guardarServicio}
      className={`rounded-xl border p-4 ${
        nuevo ? 'border-dashed border-laton/50 bg-card/50' : 'border-border bg-card'
      }`}
    >
      {s && <input type="hidden" name="id" value={s.id} />}
      <input type="hidden" name="orden" value={s?.orden ?? orden} />

      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <label className="flex flex-col gap-1">
          <CampoLabel>Nombre</CampoLabel>
          <input name="nombre" required defaultValue={s?.nombre} placeholder="Corte clásico" className={inputCls} />
        </label>
        <label className="flex flex-col gap-1">
          <CampoLabel>Categoría</CampoLabel>
          <select name="categoria" defaultValue={s?.categoria ?? 'Cortes'} className={inputCls}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 flex flex-col gap-1">
        <CampoLabel>Descripción</CampoLabel>
        <input name="descripcion" defaultValue={s?.descripcion} placeholder="Tijera y máquina…" className={inputCls} />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="flex flex-col gap-1">
          <CampoLabel>Precio (COP)</CampoLabel>
          <input type="number" name="precio" min={0} step={500} required defaultValue={s?.precio} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1">
          <CampoLabel>Duración (min)</CampoLabel>
          <input type="number" name="duracion" min={5} step={5} required defaultValue={s?.duracion} className={inputCls} />
        </label>
        <label className="flex items-center gap-2 sm:pb-2 sm:pt-6">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={s ? s.activo : true}
            className="h-4 w-4 accent-[var(--laton)]"
          />
          <span className="text-sm text-marfil">Activo</span>
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg bg-laton px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {nuevo ? <Plus className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {nuevo ? 'Agregar servicio' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default async function ServiciosPage() {
  const servicios = await getTodosLosServicios()

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-marfil">Servicios y precios</h1>
        <p className="text-sm text-marfil-tenue">
          Lo que edites aquí se refleja en el formulario de reserva del sitio.
        </p>
      </header>

      <div className="space-y-4">
        {servicios.map((s) => (
          <ServicioForm key={s.id} s={s} orden={s.orden} />
        ))}

        <div>
          <h2 className="mb-2 mt-8 font-heading text-lg font-bold text-marfil">Nuevo servicio</h2>
          <ServicioForm orden={servicios.length} />
        </div>
      </div>
    </div>
  )
}
