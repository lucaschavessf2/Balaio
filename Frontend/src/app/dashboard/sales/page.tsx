import LayoutPainel from '@/components/painel/LayoutPainel'
import GraficoFaturamento from '@/components/painel/GraficoFaturamento'
import { Migalhas } from '@/components/ui/Basicos'
import { IconeGrafico } from '@/components/ui/Icones'
import { emReais } from '@/utils/formato'

const meses = [
  { mes: 'Out', valor: 4120 },
  { mes: 'Nov', valor: 5380 },
  { mes: 'Dez', valor: 9240 },
  { mes: 'Jan', valor: 6110 },
  { mes: 'Fev', valor: 7980 },
  { mes: 'Mar', valor: 8940 },
]

const maisVendidas = [
  { nome: 'Leãozinho de Bolso', unidades: 33, receita: 5940 },
  { nome: 'Jarra de Cerâmica Imperial', unidades: 14, receita: 5320 },
  { nome: 'Leão Imperial de Tracunhaém', unidades: 4, receita: 5000 },
  { nome: 'Jarra Boiadeira', unidades: 10, receita: 5500 },
]

const pecasVendidas = maisVendidas.reduce((soma, p) => soma + p.unidades, 0)

export default function Vendas() {
  const total = meses.reduce((soma, m) => soma + m.valor, 0)
  const ticket = Math.round(total / pecasVendidas)

  return (
    <LayoutPainel ativo="vendas">
      <Migalhas trilha={[{ texto: 'Painel do artesão', href: '/dashboard' }, { texto: 'Vendas & faturamento' }]} />
      <h1 className="titulo-pagina">Vendas e faturamento</h1>
      <p className="subtitulo-pagina">
        O que entrou nos últimos seis meses e o que os números sugerem sobre a sua produção.
      </p>

      <div className="metricas">
        <div className="metrica metrica-azul">
          <p className="metrica-rotulo">Faturamento em 6 meses</p>
          <p className="metrica-valor">{emReais(total)}</p>
          <p className="metrica-nota">Já descontada a taxa da plataforma</p>
        </div>
        <div className="metrica metrica-verde">
          <p className="metrica-rotulo">Ticket médio</p>
          <p className="metrica-valor">{emReais(ticket)}</p>
          <p className="metrica-nota">Por pedido concluído</p>
        </div>
        <div className="metrica metrica-amarela">
          <p className="metrica-rotulo">Peças vendidas</p>
          <p className="metrica-valor">{pecasVendidas}</p>
          <p className="metrica-nota">No mesmo período</p>
        </div>
      </div>

      <section className="secao">
        <h2 className="secao-titulo">Faturamento por mês</h2>
        <div className="cartao">
          <GraficoFaturamento meses={meses} />
        </div>
      </section>

      <section className="secao">
        <h2 className="secao-titulo">Suas peças que mais vendem</h2>
        {maisVendidas.map((p) => (
          <article className="linha-pedido" key={p.nome}>
            <div className="dado">
              <span className="dado-rotulo">Peça</span>
              <span className="dado-valor">{p.nome}</span>
            </div>
            <div className="dado">
              <span className="dado-rotulo">Unidades</span>
              <span className="dado-valor">{p.unidades}</span>
            </div>
            <div className="dado">
              <span className="dado-rotulo">Receita</span>
              <span className="dado-valor preco-destaque">{emReais(p.receita)}</span>
            </div>
            <div className="acoes-linha">
              <span className="selo selo-neutro">
                <IconeGrafico tamanho={13} />
                {Math.round((p.receita / total) * 100)}% do total
              </span>
            </div>
          </article>
        ))}
      </section>

    </LayoutPainel>
  )
}
