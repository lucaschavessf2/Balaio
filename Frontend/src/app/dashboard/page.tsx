import Link from 'next/link'
import { Migalhas } from '@/components/ui/Basicos'
import PedidosPendentes from '@/components/pedido/PedidosPendentes'
import { IconeSetaDireita } from '@/components/ui/Icones'
import { listarPedidos, listarPedidosPendentes, listarConversasArtesao } from '@/services/api/pedidos.servico'
import { listarPecas } from '@/services/api/pecas.servico'
import { exigirArtesao } from '@/services/autenticacao'

export default async function Painel() {
  const { artesao } = await exigirArtesao()
  const [{ dados: pend }, { dados: conversas }, { dados: pecas }, { dados: pedidos }] = await Promise.all([
    listarPedidosPendentes(artesao.slug),
    listarConversasArtesao(artesao.slug),
    listarPecas(),
    listarPedidos(),
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
  const agora = new Date()
  const noMesAtual = (data: string) => {
    const [dia, mes, ano] = data.split('/').map(Number)
    const dataPedido = new Date(ano, mes - 1, dia)
    return dataPedido.getMonth() === agora.getMonth() && dataPedido.getFullYear() === agora.getFullYear()
  }

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
        enviadosMes={pedidosDoArtesao.filter((pedido) => pedido.estado === 'enviado' && noMesAtual(pedido.data)).length}
        faturamentoMes={pedidosDoArtesao.filter((pedido) => noMesAtual(pedido.data)).reduce((total, pedido) => total + pedido.total, 0)}
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
