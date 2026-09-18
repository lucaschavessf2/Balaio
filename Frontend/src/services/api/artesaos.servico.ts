import { type Artesao } from '@/types/dominio'
import { buscar, enviar } from './cliente'
import { type RespostaApi } from './tipos'

export async function listarArtesaos(): Promise<RespostaApi<Artesao[]>> {
  return buscar<Artesao[]>('/artesaos')
}

export async function obterArtesao(slug: string): Promise<RespostaApi<Artesao>> {
  return buscar<Artesao>(`/artesaos/${encodeURIComponent(slug)}`)
}

export type PerfilArtesao = Pick<Artesao, 'nome' | 'atelie' | 'historia' | 'territorio' | 'tecnica' | 'imagem'>

export function atualizarArtesao(slug: string, perfil: Partial<PerfilArtesao>): Promise<RespostaApi<Artesao>> {
  return enviar<Artesao>(`/artesaos/${encodeURIComponent(slug)}`, perfil, 'PATCH')
}

export type ConfiguracoesAtelie = {
  cepOrigem: string
  prazoPadraoDias: number
  aceitaEncomendas: boolean
  encomendasPausadas: boolean
  chavePix: string
}

export function obterConfiguracoes(slug: string): Promise<RespostaApi<ConfiguracoesAtelie>> {
  return buscar<ConfiguracoesAtelie>(`/artesaos/${encodeURIComponent(slug)}/configuracoes`)
}

export function atualizarConfiguracoes(
  slug: string,
  alteracoes: Partial<ConfiguracoesAtelie>,
): Promise<RespostaApi<ConfiguracoesAtelie>> {
  return enviar<ConfiguracoesAtelie>(`/artesaos/${encodeURIComponent(slug)}/configuracoes`, alteracoes, 'PATCH')
}
