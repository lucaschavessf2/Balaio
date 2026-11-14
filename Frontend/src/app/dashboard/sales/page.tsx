import EstadoErro from '@/components/feedback/EstadoErro'
import EstadoVazio from '@/components/feedback/EstadoVazio'
import GraficoFaturamento from '@/components/painel/GraficoFaturamento'
import { Migalhas } from '@/components/ui/Basicos'
import { IconeGrafico } from '@/components/ui/Icones'
import { emReais } from '@/utils/formato'
import { faturamentoNoMes, vendasDoArtesao } from '@/utils/vendas'
import { exigirArtesao } from '@/services/autenticacao'
import { listarPedidos } from '@/services/api/pedidos.servico'
import { pecasPorArtesao } from '@/services/api/pecas.servico'

const MESES_NO_GRAFICO = 6

export default async function Vendas() {
  const { artesao } = await exigirArtesao()
  const [{ dados: pedidos, erro: erroPedidos }, { dados: pecas, erro: erroPecas }] = await Promise.all([listarPedidos(), pecasPorArtesao(artesao.slug)])
  const erro = erroPedidos ?? erroPecas
  const vendas = vendasDoArtesao(pedidos ?? [], pecas ?? [])
  const porPeca = new Map<string, { nome: string; unidades: number; receita: number }>()
  for (const venda of vendas) {
    const atual = porPeca.get(venda.slug) ?? { nome: venda.nome, unidades: 0, receita: 0 }
    atual.unidades += venda.quantidade
    atual.receita += venda.valor
    porPeca.set(venda.slug, atual)
  }
  const maisVendidas = [...porPeca.values()].sort((a, b) => b.receita - a.receita)
  const total = maisVendidas.reduce((soma, item) => soma + item.receita, 0)
  const pecasVendidas = maisVendidas.reduce((soma, item) => soma + item.unidades, 0)
  const ticket = vendas.length ? Math.round(total / vendas.length) : 0
  const agora = new Date()
  const meses = Array.from({ length: MESES_NO_GRAFICO }, (_, indice) => {
    const data = new Date(agora.getFullYear(), agora.getMonth() - (MESES_NO_GRAFICO - 1) + indice, 1)
    return {
      mes: data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      valor: faturamentoNoMes(vendas, { ano: data.getFullYear(), mes: data.getMonth() + 1 }),
    }
  })
  const temVendaNoPeriodo = meses.some((mes) => mes.valor > 0)

  return (
    <>
      <Migalhas trilha={[{ texto: 'Painel do artesão', href: '/dashboard' }, { texto: 'Vendas & faturamento' }]} />
      <h1 className="titulo-pagina">Vendas e faturamento</h1>
      <p className="subtitulo-pagina">Resultados calculados a partir dos pedidos registrados para suas peças, sem contar os cancelados, recusados e reembolsados.</p>
      {erro ? (
        <EstadoErro mensagem={erro.mensagem} />
      ) : (
        <>
          <div className="metricas">
            <div className="metrica metrica-azul"><p className="metrica-rotulo">Faturamento total</p><p className="metrica-valor">{emReais(total)}</p></div>
            <div className="metrica metrica-verde"><p className="metrica-rotulo">Ticket médio</p><p className="metrica-valor">{emReais(ticket)}</p></div>
            <div className="metrica metrica-amarela"><p className="metrica-rotulo">Peças vendidas</p><p className="metrica-valor">{pecasVendidas}</p></div>
          </div>
          <section className="secao">
            <h2 className="secao-titulo">Faturamento dos últimos {MESES_NO_GRAFICO} meses</h2>
            {temVendaNoPeriodo ? (
              <div className="cartao"><GraficoFaturamento meses={meses} /></div>
            ) : (
              <EstadoVazio
                icone={<IconeGrafico tamanho={34} />}
                titulo={`Nenhuma venda nos últimos ${MESES_NO_GRAFICO} meses`}
                descricao={total > 0 ? 'Suas vendas anteriores continuam somadas no faturamento total, acima.' : 'Quando uma peça for vendida, o valor aparece aqui, mês a mês.'}
              />
            )}
          </section>
          {maisVendidas.length > 0 && (
            <section className="secao"><h2 className="secao-titulo">Suas peças que mais vendem</h2>{maisVendidas.map((item) => <article className="linha-pedido" key={item.nome}><div className="dado"><span className="dado-rotulo">Peça</span><span className="dado-valor">{item.nome}</span></div><div className="dado"><span className="dado-rotulo">Unidades</span><span className="dado-valor">{item.unidades}</span></div><div className="dado"><span className="dado-rotulo">Receita</span><span className="dado-valor preco-destaque">{emReais(item.receita)}</span></div><span className="selo selo-neutro"><IconeGrafico tamanho={13} />{total ? Math.round(item.receita / total * 100) : 0}% do total</span></article>)}</section>
          )}
        </>
      )}
    </>
  )
}
