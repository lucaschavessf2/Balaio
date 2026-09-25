import Link from 'next/link'
import { notFound } from 'next/navigation'
import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import EstadoVazio from '@/components/feedback/EstadoVazio'
import { IconeAviso } from '@/components/ui/Icones'
import FormAvaliacao from '@/components/forms/FormAvaliacao'
import { obterPedido } from '@/services/api/pedidos.servico'
import { obterPecaHistorico } from '@/services/api/pecas.servico'
import { obterArtesao } from '@/services/api/artesaos.servico'
import { exigirSessao } from '@/services/autenticacao'

export const dynamic = 'force-dynamic'

export default async function Avaliar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { usuario, token } = await exigirSessao()
  const { dados: pedido, erro } = await obterPedido(id, token)
  if (erro && erro.codigo !== 'RECURSO_NAO_ENCONTRADO') throw new Error(erro.mensagem)
  if (!pedido || (pedido.compradorId ?? pedido.usuarioId) !== usuario.id) notFound()

  if (pedido.estado !== 'entregue' || pedido.avaliado) {
    return (
      <Pagina>
        <Migalhas trilha={[{ texto: 'Início', href: '/' }, { texto: 'Meus pedidos', href: '/orders' }, { texto: 'Avaliar compra' }]} />
        <h1 className="titulo-pagina">Avaliar compra</h1>
        <EstadoVazio
          icone={<IconeAviso tamanho={34} />}
          titulo={pedido.avaliado ? 'Este pedido já foi avaliado' : 'A avaliação ainda não está disponível'}
          descricao={pedido.avaliado
            ? 'Você já enviou sua avaliação para esta compra.'
            : 'Você poderá avaliar a compra quando o pedido estiver marcado como entregue.'}
          acao={<Link href={`/orders/${pedido.id}`} className="botao botao-primario">Ver pedido</Link>}
        />
      </Pagina>
    )
  }

  const { dados: peca } = await obterPecaHistorico(pedido.pecaSlug)
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
        Conte como foi receber a peça. Sua nota, os critérios e o comentário ficam registrados neste pedido.
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
