import { eventos, acharEvento, type Evento } from '@/mocks/eventos'
import { API_FAKE, buscar, montarQuery } from './cliente'
import { falha, sucesso, type RespostaApi } from './tipos'

export type FiltrosEvento = { lat?: number; lng?: number }

export async function listarEventos(filtros: FiltrosEvento = {}): Promise<RespostaApi<Evento[]>> {
  if (!API_FAKE) return buscar<Evento[]>(`/eventos${montarQuery({ ...filtros })}`)
  return sucesso(eventos)
}

export async function obterEvento(slug: string): Promise<RespostaApi<Evento>> {
  if (!API_FAKE) return buscar<Evento>(`/eventos/${slug}`)
  const evento = acharEvento(slug)
  return evento ? sucesso(evento) : falha('RECURSO_NAO_ENCONTRADO', 'Evento não encontrado.')
}
