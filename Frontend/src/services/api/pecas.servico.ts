import type { Peca } from '@/types/dominio'
import { buscar, montarQuery, enviar } from './cliente'
import type { RespostaApi } from './tipos'

export type FiltrosPeca = {
  tecnica?: string; territorio?: string; categoria?: string; q?: string; disponibilidade?: string
  ordenar?: 'recentes' | 'preco-asc' | 'preco-desc' | 'avaliacao'
  pagina?: number; tamanho?: number
}
export function listarPecas(filtros: FiltrosPeca = {}): Promise<RespostaApi<Peca[]>> {
  return buscar('/pecas' + montarQuery({ ...filtros }))
}
export function obterPeca(slug: string): Promise<RespostaApi<Peca>> {
  return buscar('/pecas/' + encodeURIComponent(slug))
}
export function pecasRelacionadas(slug: string, limite = 3): Promise<RespostaApi<Peca[]>> {
  return buscar('/pecas/' + encodeURIComponent(slug) + '/relacionadas' + montarQuery({ limite }))
}
export function pecasPorArtesao(slug: string): Promise<RespostaApi<Peca[]>> {
  return buscar('/artesaos/' + encodeURIComponent(slug) + '/pecas')
}
export function criarPeca(peca: Peca): Promise<RespostaApi<Peca>> {
  return enviar('/pecas', peca)
}
