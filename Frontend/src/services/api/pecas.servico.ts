import type { Peca } from '@/types/dominio'
import { buscar, montarQuery, enviar } from './cliente'
import type { RespostaApi } from './tipos'

export type Ordenacao = 'recentes' | 'preco-asc' | 'preco-desc' | 'avaliacao'

export type FiltrosPeca = {
  tecnica?: string; territorio?: string; categoria?: string; tipo?: string; q?: string; disponibilidade?: string
  desconto?: boolean
  ordenar?: Ordenacao
  pagina?: number; tamanho?: number
}
export function listarPecas(filtros: FiltrosPeca = {}): Promise<RespostaApi<Peca[]>> {
  return buscar('/pecas' + montarQuery({ ...filtros, desconto: filtros.desconto ? 'true' : undefined }))
}
export function obterPeca(slug: string): Promise<RespostaApi<Peca>> {
  return buscar('/pecas/' + encodeURIComponent(slug))
}
export function obterPecaHistorico(slug: string): Promise<RespostaApi<Peca>> {
  return buscar('/pecas/' + encodeURIComponent(slug) + '/historico')
}
export function pecasRelacionadas(slug: string, limite = 3): Promise<RespostaApi<Peca[]>> {
  return buscar('/pecas/' + encodeURIComponent(slug) + '/relacionadas' + montarQuery({ limite }))
}
export async function pecasPorTipo(
  tipo: string,
  { excluir, limite = 12 }: { excluir?: string; limite?: number } = {},
): Promise<RespostaApi<Peca[]>> {
  const resposta = await listarPecas({ tipo, tamanho: limite + 1 })
  if (!resposta.dados) return resposta
  return { ...resposta, dados: resposta.dados.filter((peca) => peca.slug !== excluir).slice(0, limite) }
}
export function pecasPorArtesao(slug: string): Promise<RespostaApi<Peca[]>> {
  return buscar('/artesaos/' + encodeURIComponent(slug) + '/pecas')
}
export function criarPeca(peca: Peca): Promise<RespostaApi<Peca>> {
  return enviar('/pecas', peca)
}
export function atualizarPeca(slug: string, alteracoes: Partial<Peca>): Promise<RespostaApi<Peca>> {
  return enviar(`/pecas/${encodeURIComponent(slug)}`, alteracoes, 'PATCH')
}
export function excluirPeca(slug: string): Promise<RespostaApi<Peca>> {
  return buscar(`/pecas/${encodeURIComponent(slug)}`, { method: 'DELETE' })
}
