import Link from 'next/link'
import LayoutPainel from '@/components/painel/LayoutPainel'
import { Migalhas } from '@/components/ui/Basicos'
import PedidosPendentes from '@/components/pedido/PedidosPendentes'
import { IconeSetaDireita } from '@/components/ui/Icones'
import { listarPedidosPendentes, listarConversasArtesao } from '@/services/api/pedidos.servico'
import { listarPecas } from '@/services/api/pecas.servico'

export default async function Painel() {
  const [{ dados: pend }, { dados: conversas }, { dados: pecas }] = await Promise.all([
    listarPedidosPendentes(),
    listarConversasArtesao(),
    listarPecas(),
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

  return (
    <LayoutPainel ativo="pedidos">
      <Migalhas trilha={[{ texto: 'Painel do artesão', href: '/dashboard' }, { texto: 'Pedidos pendentes' }]} />
      <h1 className="titulo-pagina">Gerenciamento de pedidos</h1>
      <p className="subtitulo-pagina">
        Aceite os pedidos novos para começar a produzir. Quem comprou é avisado a cada etapa que você marcar.
      </p>

      <PedidosPendentes iniciais={pendentes} faturamentoMes={8940} />

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
    </LayoutPainel>
  )
}
