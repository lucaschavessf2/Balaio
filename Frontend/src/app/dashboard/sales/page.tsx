import LayoutPainel from '@/components/painel/LayoutPainel'
import GraficoFaturamento from '@/components/painel/GraficoFaturamento'
import { Migalhas } from '@/components/ui/Basicos'
import { IconeGrafico } from '@/components/ui/Icones'
import { emReais } from '@/utils/formato'
import { exigirArtesao } from '@/services/autenticacao'
import { listarPedidos } from '@/services/api/pedidos.servico'
import { pecasPorArtesao } from '@/services/api/pecas.servico'

export default async function Vendas() {
  const { artesao } = await exigirArtesao()
  const [{ dados: pedidos }, { dados: pecas }] = await Promise.all([listarPedidos(), pecasPorArtesao(artesao.slug)])
  const minhas = new Map((pecas ?? []).map((peca) => [peca.slug, peca]))
  const vendas = (pedidos ?? []).flatMap((pedido) => (pedido.itens ?? [{ slug: pedido.pecaSlug, quantidade: 1 }]).filter((item) => minhas.has(item.slug)).map((item) => ({ pedido, item, peca: minhas.get(item.slug)! })))
  const porPeca = new Map<string, { nome: string; unidades: number; receita: number }>()
  for (const venda of vendas) {
    const atual = porPeca.get(venda.item.slug) ?? { nome: venda.peca.nome, unidades: 0, receita: 0 }
    atual.unidades += venda.item.quantidade
    atual.receita += venda.peca.preco * venda.item.quantidade
    porPeca.set(venda.item.slug, atual)
  }
  const maisVendidas = [...porPeca.values()].sort((a, b) => b.receita - a.receita)
  const total = maisVendidas.reduce((soma, item) => soma + item.receita, 0)
  const pecasVendidas = maisVendidas.reduce((soma, item) => soma + item.unidades, 0)
  const ticket = vendas.length ? Math.round(total / vendas.length) : 0
  const agora = new Date()
  const meses = Array.from({ length: 6 }, (_, indice) => {
    const data = new Date(agora.getFullYear(), agora.getMonth() - 5 + indice, 1)
    const rotulo = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    const valor = vendas.filter(({ pedido }) => {
      const partes = pedido.data.split('/').map(Number)
      return partes.length === 3 && partes[1] === data.getMonth() + 1 && partes[2] === data.getFullYear()
    }).reduce((soma, venda) => soma + venda.peca.preco * venda.item.quantidade, 0)
    return { mes: rotulo, valor }
  })
  return (
    <LayoutPainel ativo="vendas">
      <Migalhas trilha={[{ texto: 'Painel do artesão', href: '/dashboard' }, { texto: 'Vendas & faturamento' }]} />
      <h1 className="titulo-pagina">Vendas e faturamento</h1>
      <p className="subtitulo-pagina">Resultados calculados a partir dos pedidos registrados para suas peças.</p>
      <div className="metricas">
        <div className="metrica metrica-azul"><p className="metrica-rotulo">Faturamento</p><p className="metrica-valor">{emReais(total)}</p></div>
        <div className="metrica metrica-verde"><p className="metrica-rotulo">Ticket médio</p><p className="metrica-valor">{emReais(ticket)}</p></div>
        <div className="metrica metrica-amarela"><p className="metrica-rotulo">Peças vendidas</p><p className="metrica-valor">{pecasVendidas}</p></div>
      </div>
      <section className="secao"><h2 className="secao-titulo">Faturamento por mês</h2><div className="cartao"><GraficoFaturamento meses={meses} /></div></section>
      <section className="secao"><h2 className="secao-titulo">Suas peças que mais vendem</h2>{maisVendidas.map((item) => <article className="linha-pedido" key={item.nome}><div className="dado"><span className="dado-rotulo">Peça</span><span className="dado-valor">{item.nome}</span></div><div className="dado"><span className="dado-rotulo">Unidades</span><span className="dado-valor">{item.unidades}</span></div><div className="dado"><span className="dado-rotulo">Receita</span><span className="dado-valor preco-destaque">{emReais(item.receita)}</span></div><span className="selo selo-neutro"><IconeGrafico tamanho={13} />{total ? Math.round(item.receita / total * 100) : 0}% do total</span></article>)}</section>
    </LayoutPainel>
  )
}
