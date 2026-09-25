import type { Evento } from '@/mocks/eventos'
import { buscar, enviar, montarQuery } from './cliente'
import { type RespostaApi } from './tipos'

export type FiltrosEvento = { lat?: number; lng?: number }

export async function listarEventos(filtros: FiltrosEvento = {}): Promise<RespostaApi<Evento[]>> {
  return buscar<Evento[]>(`/eventos${montarQuery({ ...filtros })}`)
}

export async function obterEvento(slug: string): Promise<RespostaApi<Evento>> {
  return buscar<Evento>(`/eventos/${encodeURIComponent(slug)}`)
}

export function criarEvento(evento: Evento): Promise<RespostaApi<Evento>> {
  return enviar('/eventos', evento)
}
