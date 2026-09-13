import Link from 'next/link'
import { notFound } from 'next/navigation'
import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import FormMediacao from '@/components/forms/FormMediacao'
import { obterPedido, listarPedidos } from '@/services/api/pedidos.servico'
import { obterPeca } from '@/services/api/pecas.servico'
import { obterArtesao } from '@/services/api/artesaos.servico'

export async function generateStaticParams() {
  const { dados } = await listarPedidos()
  return (dados ?? []).map((p) => ({ id: p.id }))
}

export default async function Mediacao({ params }: { params: Promise<{ id: string }> }) {
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
          { texto: 'Mediação' },
        ]}
      />

      <h1 className="titulo-pagina">Pedir mediação da plataforma</h1>
      <p className="subtitulo-pagina">
        Quando a conversa direta não resolve, a plataforma entra para ouvir os dois lados e garantir uma saída justa.
      </p>

      <div className="duas-colunas">
        <FormMediacao
          pedidoId={pedido.id}
          pecaNome={peca?.nome}
          pecaImagem={peca?.imagem}
          atelie={artesao?.atelie}
        />

        <aside className="cartao">
          <h2 className="secao-titulo">Como funciona a mediação</h2>
          <ol className="lista-passos-evento abaixo-4">
            <li>Você conta o que aconteceu e o que resolveria.</li>
            <li>O artesão é notificado e as duas partes têm 48h para responder.</li>
            <li>Enquanto durar a mediação, o repasse do pagamento fica retido.</li>
            <li>Sem acordo, a equipe da plataforma decide com base no histórico do pedido.</li>
          </ol>
          <p className="texto-suave">
            Antes de abrir, vale tentar mais uma vez pela{' '}
            <Link href={`/orders/${pedido.id}#conversa-pedido`}>conversa com o artesão</Link>. A maioria dos casos se
            resolve por lá.
          </p>
        </aside>
      </div>
    </Pagina>
  )
}
