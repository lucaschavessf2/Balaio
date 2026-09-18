import type { Destaque } from '@/components/produto/CarrosselDestaques'
import { destaquesEditoriais } from '@/constants/vitrine'
import type { Peca } from '@/types/dominio'

export const MAXIMO_POR_PRATELEIRA = 12

export type Vitrine = {
  ofertas: Peca[]
  maisAvaliadas: Peca[]
}

const limitar = (pecas: Peca[]) => pecas.slice(0, MAXIMO_POR_PRATELEIRA)

export function montarVitrine(pecas: Peca[]): Vitrine {
  const ofertas = pecas.filter((p) => (p.desconto ?? 0) > 0).sort((a, b) => (b.desconto ?? 0) - (a.desconto ?? 0))
  const maisAvaliadas = [...pecas].sort(
    (a, b) => (b.avaliacao ?? 0) - (a.avaliacao ?? 0) || (b.totalAvaliacoes ?? 0) - (a.totalAvaliacoes ?? 0),
  )
  return { ofertas: limitar(ofertas), maisAvaliadas: limitar(maisAvaliadas) }
}

export function montarDestaques(pecas: Peca[]): Destaque[] {
  const mapaPecas = new Map(pecas.map((peca) => [peca.slug, peca]))
  return destaquesEditoriais.flatMap(({ slug, titulo }) => {
    const peca = mapaPecas.get(slug)
    return peca
      ? [{ slug, titulo, nome: peca.nome, territorio: peca.territorio, resumo: peca.historia[0], imagem: peca.imagem }]
      : []
  })
}
