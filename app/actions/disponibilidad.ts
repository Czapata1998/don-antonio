'use server'

import { getServiciosActivos, getSlots, getDiasDisponibles } from '@/lib/repo'
import type { Servicio, Slot, DiaDisponible } from '@/lib/mock-data'

// Lecturas públicas para el flujo de reserva (catálogo + días + horarios reales).

export async function getServiciosPublicos(): Promise<Servicio[]> {
  return getServiciosActivos()
}

// Días abiertos según la jornada configurada por el barbero.
export async function getDiasPublicos(): Promise<DiaDisponible[]> {
  return getDiasDisponibles(6)
}

// Horarios del día. `duracionMin` = duración total de lo elegido, para que
// solo se ofrezcan inicios donde el servicio cabe completo.
export async function getSlotsPublicos(
  fechaISO: string,
  duracionMin = 0,
): Promise<Slot[]> {
  return getSlots(fechaISO, duracionMin)
}
