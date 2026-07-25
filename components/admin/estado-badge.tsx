const estilos: Record<string, string> = {
  pendiente: 'bg-[rgb(var(--laton-rgb)/0.15)] text-laton-claro',
  atendida: 'bg-[rgb(159_230_160/0.15)] text-[rgb(159_230_160)]',
  cancelada: 'bg-[rgb(248_113_113/0.14)] text-[rgb(248_113_113)] line-through',
}

const etiqueta: Record<string, string> = {
  pendiente: 'Pendiente',
  atendida: 'Atendida',
  cancelada: 'Cancelada',
}

export function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        estilos[estado] ?? estilos.pendiente
      }`}
    >
      {etiqueta[estado] ?? estado}
    </span>
  )
}
