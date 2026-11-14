import Link from 'next/link'
import { Migalhas } from '@/components/ui/Basicos'
import PedidosPendentes from '@/components/pedido/PedidosPendentes'
import { IconeSetaDireita } from '@/components/ui/Icones'
import { listarVendasArtesao, listarPedidosPendentes, listarConversasArtesao } from '@/services/api/pedidos.servico'
import { pecasPorArtesao } from '@/services/api/pecas.servico'
import { exigirArtesao } from '@/services/autenticacao'
import { ESTADOS_ENCERRADOS, faturamentoNoMes, vendasDoArtesao } from '@/utils/vendas'

export default async function Painel() {
  const { artesao, token } = await exigirArtesao()
  const [{ dados: pend }, { dados: conversas }, { dados: pecas }, { dados: pedidos }] = await Promise.all([
    listarPedidosPendentes(artesao.slug, token),
    listarConversasArtesao(artesao.slug),
    pecasPorArtesao(artesao.slug, token),
    listarVendasArtesao(artesao.slug, token),
  ])
  const mapaPecas = new Map((pecas ?? []).map((p) => [p.slug, p]))
  const conversasArtesao = conversas ?? []

  const pendentes = (pend ?? []).map((pedido) => {
    const peca = mapaPecas.get(pedido.pecaSlug)
    return {
      id: pedido.id,
      comprador: pedido.comprador,
      quando: pedido.quando,
      valor: pedido.valor,
      pecaNome: peca?.nome,
      pecaTecnica: peca?.tecnica,
      pecaImagem: peca?.imagem,
    }
  })

  const naoLidas = conversasArtesao.filter((c) => c.naoLida).length
  const slugsDoArtesao = new Set((pecas ?? []).filter((peca) => peca.artesao === artesao.slug).map((peca) => peca.slug))
  const pedidosDoArtesao = (pedidos ?? []).filter((pedido) =>
    (pedido.itens ?? [{ slug: pedido.pecaSlug }]).some((item) => slugsDoArtesao.has(item.slug)),
  )
  const pecasUnicasVendidas = new Set(
    pedidosDoArtesao.filter((pedido) => !ESTADOS_ENCERRADOS.has(pedido.estado)).flatMap((pedido) =>
      (pedido.itens ?? [{ slug: pedido.pecaSlug }])
        .filter((item) => mapaPecas.get(item.slug)?.disponibilidade === 'unica')
        .map((item) => item.slug),
    ),
  )
  const pecasAtivas = (pecas ?? []).filter((peca) =>
    !peca.inativadoEm && !pecasUnicasVendidas.has(peca.slug) && (peca.situacao ?? 'publicada') === 'publicada',
  ).length
  const avisosPecas = (pecas ?? []).flatMap((peca) => {
    if (pecasUnicasVendidas.has(peca.slug) || peca.vendidaEmPedido) return [{ slug: peca.slug, nome: peca.nome, motivo: 'Peça única vendida' }]
    if (peca.inativadoEm) return [{ slug: peca.slug, nome: peca.nome, motivo: 'Peça inativada' }]
    return []
  })
  const agora = new Date()
  const faturamentoMes = faturamentoNoMes(vendasDoArtesao(pedidosDoArtesao, pecas ?? []), {
    ano: agora.getFullYear(),
    mes: agora.getMonth() + 1,
  })

  return (
    <>
      <Migalhas trilha={[{ texto: 'Painel do artesão', href: '/dashboard' }, { texto: 'Pedidos pendentes' }]} />
      <h1 className="titulo-pagina">Gerenciamento de pedidos</h1>
      <p className="subtitulo-pagina">
        Aceite os pedidos novos para começar a produzir. Quem comprou é avisado a cada etapa que você marcar.
      </p>

      <PedidosPendentes
        iniciais={pendentes}
        emProducao={pedidosDoArtesao.filter((pedido) => pedido.estado === 'producao').length}
        pecasAtivas={pecasAtivas}
        avisosPecas={avisosPecas}
        faturamentoMes={faturamentoMes}
      />

      <section className="secao">
        <h2 className="secao-titulo">Conversas</h2>
        <div className="cartao linha-flex linha-entre">
          <p>
            {conversasArtesao.length} conversas em andamento
            {naoLidas > 0 ? ` · ${naoLidas} não ${naoLidas === 1 ? 'lida' : 'lidas'}` : ''}
          </p>
          <Link href="/dashboard/messages" className="botao botao-primario">
            Ver central de mensagens
            <IconeSetaDireita />
          </Link>
        </div>
      </section>
    </>
  )
}
