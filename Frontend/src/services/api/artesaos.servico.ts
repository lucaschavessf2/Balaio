import { type Artesao } from '@/types/dominio'
import { buscar, enviar } from './cliente'
import { type RespostaApi } from './tipos'

export async function listarArtesaos(): Promise<RespostaApi<Artesao[]>> {
  return buscar<Artesao[]>('/artesaos')
}

export async function obterArtesao(slug: string): Promise<RespostaApi<Artesao>> {
  return buscar<Artesao>(`/artesaos/${encodeURIComponent(slug)}`)
}

export const obterMeuAtelie = (token?: string) => buscar<Artesao>('/artesao/me', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
export const atualizarMeuAtelie = (alteracoes: Partial<Artesao>) => enviar<Artesao>('/artesao/me', alteracoes, 'PATCH')
