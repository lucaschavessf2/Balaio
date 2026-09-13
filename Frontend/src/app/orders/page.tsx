import Link from 'next/link'
import Pagina from '@/components/layout/Pagina'
import { EstadoVazio, Foto, Migalhas } from '@/components/ui/Basicos'
import BotaoAdicionarSacola from '@/components/carrinho/BotaoAdicionarSacola'
import { IconePacote } from '@/components/ui/Icones'
import { listarPedidos } from '@/services/api/pedidos.servico'
import { listarPecas } from '@/services/api/pecas.servico'
import { listarArtesaos } from '@/services/api/artesaos.servico'
import { emReais } from '@/utils/formato'
import { rotuloEstadoPedido } from '@/constants/rotulos'

export default async function MeusPedidos() {
  const [{ dados: pedidos }, { dados: pecas }, { dados: artesaos }] = await Promise.all([
    listarPedidos(),
    listarPecas(),
    listarArtesaos(),
  ])
  const mapaPecas = new Map((pecas ?? []).map((p) => [p.slug, p]))
  const mapaArtesaos = new Map((artesaos ?? []).map((a) => [a.slug, a]))
  const acharPeca = (slug: string) => mapaPecas.get(slug)
  const acharArtesao = (slug: string) => mapaArtesaos.get(slug)
  const listaPedidos = pedidos ?? []
  return (
    <Pagina>
      <Migalhas trilha={[{ texto: 'Início', href: '/' }, { texto: 'Meus pedidos' }]} />

      <h1 className="titulo-pagina">Meus pedidos</h1>
      <p className="subtitulo-pagina">
        Acompanhe o que está sendo produzido, o que está a caminho e o que já chegou.
      </p>

      {listaPedidos.length === 0 ? (
        <EstadoVazio
          icone={<IconePacote tamanho={34} />}
          titulo="Você ainda não fez nenhum pedido"
          descricao="Quando comprar sua primeira peça, ela aparece aqui com todas as etapas da produção e do envio."
          acao={
            <Link href="/" className="botao botao-primario">
              Explorar o catálogo
            </Link>
          }
        />
      ) : (
        listaPedidos.map((pedido) => {
          const peca = acharPeca(pedido.pecaSlug)
          const artesao = peca ? acharArtesao(peca.artesao) : undefined
          const estado = rotuloEstadoPedido[pedido.estado]
          const entregue = pedido.estado === 'entregue'

          return (
            <article className="cartao-pedido" key={pedido.id}>
              <header className="cartao-pedido-topo">
                <span className={`selo ${estado.classe}`}>
                  <span className="selo-ponto" />
                  {estado.texto}
                </span>
                <span className="dado-rotulo">{pedido.data}</span>
              </header>

              <Link href={`/orders/${pedido.id}`} className="cartao-pedido-corpo">
                <div className="cartao-pedido-figura">
                  {peca && <Foto nome={peca.nome} imagem={peca.imagem} decorativa />}
                </div>
                <div className="encolhivel">
                  <p className="texto-forte">{peca?.nome}</p>
                  <p className="autoria">
                    por {artesao?.nome} · Pedido #{pedido.id}
                  </p>
                  <p className={`cartao-pedido-status${entregue ? ' status-bom' : ''}`}>
                    {entregue ? 'Entregue no seu endereço' : `Previsão de entrega: ${pedido.previsaoEntrega}`}
                  </p>
                  <p className="preco-destaque">{emReais(pedido.total)}</p>
                </div>
              </Link>

              <footer className="acoes-linha acoes-empilhaveis cartao-pedido-acoes">
                {!entregue && (
                  <Link href={`/orders/${pedido.id}`} className="botao botao-primario">
                    Acompanhar pedido
                  </Link>
                )}
                {entregue && !pedido.avaliado && (
                  <Link href={`/orders/${pedido.id}/review`} className="botao botao-sucesso">
                    Avaliar
                  </Link>
                )}
                {entregue && peca && (
                  <BotaoAdicionarSacola
                    slug={peca.slug}
                    disponibilidade={peca.disponibilidade}
                    texto="Comprar de novo"
                    className="botao botao-secundario"
                  />
                )}
                {entregue && (
                  <Link href={`/orders/${pedido.id}`} className="botao botao-fantasma">
                    Ver detalhes
                  </Link>
                )}
                <Link href={`/orders/${pedido.id}/mediation`} className="botao botao-fantasma">
                  Preciso de ajuda
                </Link>
              </footer>
            </article>
          )
        })
      )}
    </Pagina>
  )
}
