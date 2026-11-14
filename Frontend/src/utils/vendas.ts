import type { EstadoPedido, Peca, Pedido } from '@/types/dominio'

const NOMES_DOS_MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export const ESTADOS_ENCERRADOS: ReadonlySet<EstadoPedido> = new Set<EstadoPedido>(['recusado', 'cancelado', 'reembolsado'])

export type MesDoAno = { ano: number; mes: number }

export function mesDoPedido(data: string): MesDoAno | null {
  const numerica = data.match(/^\d{1,2}\/(\d{1,2})\/(\d{4})$/)
  if (numerica) return { ano: Number(numerica[2]), mes: Number(numerica[1]) }

  const porExtenso = data.match(/^\d{1,2} de (\p{L}+),? (?:de )?(\d{4})$/u)
  if (!porExtenso) return null
  const indice = NOMES_DOS_MESES.indexOf(porExtenso[1].toLocaleLowerCase('pt-BR'))
  return indice < 0 ? null : { ano: Number(porExtenso[2]), mes: indice + 1 }
}

export function vendasDoArtesao(pedidos: Pedido[], pecas: Peca[]) {
  const mapaPecas = new Map(pecas.map((peca) => [peca.slug, peca]))
  return pedidos
    .filter((pedido) => !ESTADOS_ENCERRADOS.has(pedido.estado))
    .flatMap((pedido) => (pedido.itens ?? [{ slug: pedido.pecaSlug, quantidade: 1, preco: undefined }]).flatMap((item) => {
      const peca = mapaPecas.get(item.slug)
      if (!peca) return []
      return [{ slug: item.slug, nome: peca.nome, quantidade: item.quantidade, valor: (item.preco ?? peca.preco) * item.quantidade, mes: mesDoPedido(pedido.data) }]
    }))
}

export function faturamentoNoMes(vendas: ReturnType<typeof vendasDoArtesao>, { ano, mes }: MesDoAno): number {
  return vendas
    .filter((venda) => venda.mes?.ano === ano && venda.mes.mes === mes)
    .reduce((total, venda) => total + venda.valor, 0)
}
