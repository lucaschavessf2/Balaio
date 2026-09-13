import Link from 'next/link'
import { notFound } from 'next/navigation'
import Pagina from '@/components/layout/Pagina'
import { Foto, Migalhas } from '@/components/ui/Basicos'
import { IconeCheck, IconeConversa, IconeSetaDireita } from '@/components/ui/Icones'
import { obterPedido, listarPedidos } from '@/services/api/pedidos.servico'
import { obterPeca } from '@/services/api/pecas.servico'
import { obterArtesao } from '@/services/api/artesaos.servico'
import { emReais } from '@/utils/formato'

export async function generateStaticParams() {
  const { dados } = await listarPedidos()
  return (dados ?? []).map((p) => ({ id: p.id }))
}

export default async function Confirmacao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { dados: pedido } = await obterPedido(id)
  if (!pedido) notFound()

  const { dados: peca } = await obterPeca(pedido.pecaSlug)
  const artesao = peca ? (await obterArtesao(peca.artesao)).dados : null

  return (
    <Pagina>
      <Migalhas trilha={[{ texto: 'Início', href: '/' }, { texto: 'Pedido confirmado' }]} />

      <div className="cartao estado-vazio">
        <span className="estado-vazio-icone" style={{ background: 'var(--verde)', color: 'var(--branco)' }}>
          <IconeCheck tamanho={38} />
        </span>
        <h1 className="titulo-pagina">Pagamento confirmado</h1>
        <p className="subtitulo-pagina" style={{ margin: '0 auto 24px' }}>
          Seu pedido <strong>#{pedido.id}</strong> foi para o artesão. Ele já foi avisado e vai começar a produção.
        </p>
        <span className="selo-pago">
          <IconeCheck />
          Valor retido com segurança até a entrega
        </span>
      </div>

      <div className="duas-colunas secao">
        <section className="cartao">
          <h2 className="secao-titulo">O que você comprou</h2>
          {peca && (
            <div className="item-sacola" style={{ borderBottom: 0 }}>
              <div className="item-sacola-figura">
                <Foto nome={peca.nome} imagem={peca.imagem} decorativa />
              </div>
              <div className="encolhivel">
                <p className="texto-forte">{peca.nome}</p>
                <p className="autoria">
                  por {artesao?.nome} · {peca.territorio}
                </p>
                <p className="preco preco-destaque acima-2">{emReais(pedido.total)}</p>
              </div>
            </div>
          )}

          <p className="nota-fiscal acima-4">
            Enviamos o comprovante para o seu e-mail. A nota fiscal, quando aplicável, é emitida pela plataforma em nome
            do artesão.
          </p>
        </section>

        <section className="cartao">
          <h2 className="secao-titulo">E agora, o que acontece</h2>
          <ol style={{ paddingLeft: 18, display: 'grid', gap: 14, color: 'var(--tinta-suave)', margin: 0 }}>
            <li>
              <strong style={{ color: 'var(--tinta)' }}>O artesão aceita o pedido</strong> e começa a produzir. Você
              recebe um aviso quando isso acontecer.
            </li>
            <li>
              <strong style={{ color: 'var(--tinta)' }}>Você acompanha cada etapa</strong> pela página do pedido, com
              notas escritas pelo próprio artesão.
            </li>
            <li>
              <strong style={{ color: 'var(--tinta)' }}>A peça é coletada na oficina</strong> e você recebe o código de
              rastreio.
            </li>
            <li>
              <strong style={{ color: 'var(--tinta)' }}>Na entrega</strong>, o valor é liberado para o artesão e você
              pode avaliar a compra.
            </li>
          </ol>

          <div className="acoes-linha acoes-empilhaveis acima-5">
            <Link href={`/orders/${pedido.id}`} className="botao botao-primario">
              Acompanhar pedido
              <IconeSetaDireita />
            </Link>
            <Link href={`/orders/${pedido.id}#conversa-pedido`} className="botao botao-secundario">
              <IconeConversa />
              Falar com o artesão
            </Link>
          </div>
        </section>
      </div>
    </Pagina>
  )
}
