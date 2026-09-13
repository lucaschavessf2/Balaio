import { pecas, acharPeca, pecasDoArtesao } from '@/mocks/pecas'
import { type Peca } from '@/types/dominio'
import { precoComDesconto } from '@/utils/formato'
import { API_FAKE, buscar, montarQuery } from './cliente'
import { falha, paginar, sucesso, type RespostaApi } from './tipos'

export type FiltrosPeca = {
  tecnica?: string
  territorio?: string
  categoria?: string
  q?: string
  disponibilidade?: string
  ordenar?: 'recentes' | 'preco-asc' | 'preco-desc' | 'avaliacao'
  pagina?: number
  tamanho?: number
}

function ordenarPecas(lista: Peca[], ordenar?: FiltrosPeca['ordenar']): Peca[] {
  if (ordenar === 'preco-asc') return [...lista].sort((a, b) => precoComDesconto(a) - precoComDesconto(b))
  if (ordenar === 'preco-desc') return [...lista].sort((a, b) => precoComDesconto(b) - precoComDesconto(a))
  if (ordenar === 'avaliacao') return [...lista].sort((a, b) => (b.avaliacao ?? 0) - (a.avaliacao ?? 0))
  return lista
}

export async function listarPecas(filtros: FiltrosPeca = {}): Promise<RespostaApi<Peca[]>> {
  if (!API_FAKE) return buscar<Peca[]>(`/pecas${montarQuery({ ...filtros })}`)

  let lista = [...pecas]
  const q = filtros.q?.trim().toLowerCase()
  if (q) {
    lista = lista.filter((p) => `${p.nome} ${p.artesao} ${p.territorio} ${p.tecnica}`.toLowerCase().includes(q))
  }
  if (filtros.tecnica) lista = lista.filter((p) => p.tecnica === filtros.tecnica)
  if (filtros.territorio) lista = lista.filter((p) => p.territorio === filtros.territorio)
  if (filtros.categoria) lista = lista.filter((p) => p.categoria === filtros.categoria)
  if (filtros.disponibilidade) lista = lista.filter((p) => p.disponibilidade === filtros.disponibilidade)

  lista = ordenarPecas(lista, filtros.ordenar)
  const { itens, paginacao } = paginar(lista, filtros.pagina ?? 1, filtros.tamanho ?? lista.length)
  return sucesso(itens, paginacao)
}

export async function obterPeca(slug: string): Promise<RespostaApi<Peca>> {
  if (!API_FAKE) return buscar<Peca>(`/pecas/${slug}`)
  const peca = acharPeca(slug)
  return peca ? sucesso(peca) : falha('RECURSO_NAO_ENCONTRADO', 'Peça não encontrada.')
}

export async function pecasRelacionadas(slug: string, limite = 3): Promise<RespostaApi<Peca[]>> {
  if (!API_FAKE) return buscar<Peca[]>(`/pecas/${slug}/relacionadas`)
  const peca = acharPeca(slug)
  if (!peca) return falha('RECURSO_NAO_ENCONTRADO', 'Peça não encontrada.')
  const relacionadas = pecas.filter((p) => p.slug !== slug && p.tecnica === peca.tecnica).slice(0, limite)
  return sucesso(relacionadas)
}

export async function pecasPorArtesao(artesaoSlug: string): Promise<RespostaApi<Peca[]>> {
  if (!API_FAKE) return buscar<Peca[]>(`/artesaos/${artesaoSlug}/pecas`)
  return sucesso(pecasDoArtesao(artesaoSlug))
}
