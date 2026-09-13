import Link from 'next/link'
import { notFound } from 'next/navigation'
import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import FormAvaliacao from '@/components/forms/FormAvaliacao'
import { obterPedido, listarPedidos } from '@/services/api/pedidos.servico'
import { obterPeca } from '@/services/api/pecas.servico'
import { obterArtesao } from '@/services/api/artesaos.servico'

export async function generateStaticParams() {
  const { dados } = await listarPedidos()
  return (dados ?? []).map((p) => ({ id: p.id }))
}

export default async function Avaliar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { dados: pedido } = await obterPedido(id)
  if (!pedido) notFound()

  const { dados: peca } = await obterPeca(pedido.pecaSlug)
  const artesao = peca ? (await obterArtesao(peca.artesao)).dados : null

  return (
    <Pagina>
      <Migalhas
        trilha={[
          { texto: 'Início', href: '/' },
          { texto: 'Meus pedidos', href: '/orders' },
          { texto: `Pedido #${pedido.id}`, href: `/orders/${pedido.id}` },
          { texto: 'Avaliar' },
        ]}
      />

      <h1 className="titulo-pagina">Como foi sua compra?</h1>
      <p className="subtitulo-pagina">
        Sua avaliação ajuda outros compradores e é o principal sinal de confiança que o artesão constrói na plataforma.
      </p>

      <div className="duas-colunas">
        <FormAvaliacao
          pedidoId={pedido.id}
          pecaNome={peca?.nome}
          pecaImagem={peca?.imagem}
          artesaoNome={artesao?.nome}
        />

        <aside className="cartao">
          <h2 className="secao-titulo">Por que isso importa</h2>
          <p className="texto-suave abaixo-3">
            Boa parte dos artesãos daqui vendia só em feira, onde a reputação passava de boca em boca. Na internet, a
            avaliação é o que ocupa esse lugar.
          </p>
          <p className="texto-suave">
            Se algo deu errado, avaliar não é o único caminho: você pode{' '}
            <Link href={`/orders/${pedido.id}`}>abrir uma conversa</Link> com o artesão ou{' '}
            <Link href={`/orders/${pedido.id}/mediation`}>pedir mediação da plataforma</Link>.
          </p>
        </aside>
      </div>
    </Pagina>
  )
}
