import { type Artesao } from '@/types/dominio'
import { buscar } from './cliente'
import { type RespostaApi } from './tipos'

export async function listarArtesaos(): Promise<RespostaApi<Artesao[]>> {
  return buscar<Artesao[]>('/artesaos')
}

export async function obterArtesao(slug: string): Promise<RespostaApi<Artesao>> {
  return buscar<Artesao>(`/artesaos/${encodeURIComponent(slug)}`)
}
