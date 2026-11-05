import type { Coletivo, Peca, SolicitacaoSeloNaFila } from '@/types/dominio'

const UM_DIA_MS = 24 * 60 * 60 * 1000

export type SolicitacaoComEvidencias = SolicitacaoSeloNaFila & {
  pecas: Pick<Peca, 'slug' | 'nome' | 'imagem'>[]
  coletivo: string | null
  diasEsperando: number
}

const estaPublicada = (peca: Peca) => !peca.inativadoEm && peca.situacao !== 'rascunho'

function diasDesde(iso: string, agora: number): number {
  const dias = Math.floor((agora - new Date(iso).getTime()) / UM_DIA_MS)
  return Number.isNaN(dias) ? 0 : Math.max(0, dias)
}

export function montarFilaCuradoria(
  fila: SolicitacaoSeloNaFila[],
  pecasDaFila: Peca[][],
  coletivos: Coletivo[],
): SolicitacaoComEvidencias[] {
  const agora = Date.now()
  return fila
    .map((item, indice) => ({
      ...item,
      pecas: pecasDaFila[indice].filter(estaPublicada).map(({ slug, nome, imagem }) => ({ slug, nome, imagem })),
      coletivo: coletivos.find((coletivo) => coletivo.membros.includes(item.artesaoSlug))?.nome ?? null,
      diasEsperando: diasDesde(item.solicitadoEm, agora),
    }))
    .sort((a, b) => a.solicitadoEm.localeCompare(b.solicitadoEm))
}
