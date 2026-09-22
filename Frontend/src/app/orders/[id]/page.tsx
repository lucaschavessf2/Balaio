import Link from 'next/link'
import { notFound } from 'next/navigation'
import Pagina from '@/components/layout/Pagina'
import ResumoItensPedido from '@/components/pedido/ResumoItensPedido'
import { Migalhas } from '@/components/ui/Basicos'
import ConversaPedido from '@/components/pedido/ConversaPedido'
import BotaoRastreio from '@/components/pedido/BotaoRastreio'
import { IconeCaminhao, IconeCheck, IconeSetaDireita } from '@/components/ui/Icones'
import { obterPedido, conversaDoPedido } from '@/services/api/pedidos.servico'
import { obterPecaHistorico } from '@/services/api/pecas.servico'
import { obterArtesao } from '@/services/api/artesaos.servico'
import { rotuloEstadoPedido } from '@/constants/rotulos'
import { exigirSessao } from '@/services/autenticacao'

export const dynamic = 'force-dynamic'

export default async function Acompanhamento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { usuario, token } = await exigirSessao()
  const { dados: pedido, erro } = await obterPedido(id, token)
  if (erro && erro.codigo !== 'RECURSO_NAO_ENCONTRADO') throw new Error(erro.mensagem)
  if (!pedido || (pedido.compradorId ?? pedido.usuarioId) !== usuario.id) notFound()

  const { dados: peca } = await obterPecaHistorico(pedido.pecaSlug)
  const artesao = peca ? (await obterArtesao(peca.artesao)).dados : null
  const { dados: conversa } = await conversaDoPedido(id)

  return (
    <Pagina>
      <Migalhas
        trilha={[
          { texto: 'Início', href: '/' },
          { texto: 'Meus pedidos', href: '/orders' },
          { texto: `Pedido #${pedido.id}` },
        ]}
      />

      <h1 className="titulo-pagina">Acompanhamento de pedido</h1>
      <p className="subtitulo-pagina">
        Cada etapa é atualizada pelo próprio artesão. Você pode falar com ele a qualquer momento por aqui.
      </p>

      <div className="duas-colunas">
        <div>
          <section className="cartao abaixo-5">
            <div className="linha-flex linha-entre">
              <div>
                <p className="territorio">Código do pedido</p>
                <p className="dado-valor" style={{ fontSize: 18 }}>
                  #{pedido.id}
                </p>
                <span className={`selo ${rotuloEstadoPedido[pedido.estado].classe} acima-2`}>
                  <span className="selo-ponto" />
                  {rotuloEstadoPedido[pedido.estado].texto}
                </span>
              </div>
              <div className="texto-direita">
                <p className="dado-rotulo">Data da compra</p>
                <p className="dado-valor">{pedido.data}</p>
              </div>
            </div>

            <ResumoItensPedido pedido={pedido} />
          </section>

          <section className="cartao abaixo-5">
            <h2 className="secao-titulo">Status de produção e entrega</h2>

            <ol className="linha-tempo">
              {pedido.etapas.map((etapa) => (
                <li
                  key={etapa.estado}
                  className={`etapa${etapa.concluida ? ' etapa-feita' : ''}${etapa.atual ? ' etapa-atual' : ''}`}
                >
                  <span className="etapa-marca">
                    {etapa.concluida ? <IconeCheck tamanho={14} /> : etapa.atual ? <IconeCaminhao tamanho={14} /> : null}
                  </span>
                  <div className="encolhivel">
                    <p className="etapa-titulo">
                      {etapa.titulo}
                      {etapa.atual && <span className="selo selo-encomenda">Fase atual</span>}
                    </p>
                    <p className="etapa-detalhe">{etapa.detalhe}</p>
                    {etapa.nota && (
                      <p className="nota-artesao">
                        <strong>Nota do artesão:</strong> <em>{etapa.nota}</em>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="cartao">
            <h2 className="secao-titulo">Informações de envio</h2>
            <div className="grade-dois">
              <div className="dado">
                <span className="dado-rotulo">Código de rastreamento</span>
                <span className="dado-valor preco-destaque">{pedido.rastreio}</span>
              </div>
              <div className="dado">
                <span className="dado-rotulo">Transportadora parceira</span>
                <span className="dado-valor">{pedido.transportadora}</span>
              </div>
              <div className="dado">
                <span className="dado-rotulo">Entrega estimada</span>
                <span className="dado-valor" style={{ color: 'var(--verde-tinta)' }}>
                  {pedido.previsaoEntrega}
                </span>
              </div>
            </div>
            <BotaoRastreio
              className="botao botao-secundario acima-4"
              codigo={pedido.rastreio}
              transportadora={pedido.transportadora}
            >
              Acompanhar na transportadora
              <IconeSetaDireita />
            </BotaoRastreio>
          </section>

          <section className="cartao acima-5">
            <h2 className="secao-titulo">Algo deu errado?</h2>
            <p className="texto-suave abaixo-3">
              Fale primeiro com o artesão pela conversa ao lado. A maioria dos casos se resolve por lá. Se não
              resolver, a plataforma entra como mediadora e o repasse do pagamento fica retido até a decisão.
            </p>
            <Link href={`/orders/${pedido.id}/mediation`} className="botao botao-fantasma">
              Pedir mediação da plataforma
            </Link>
          </section>
        </div>

        <ConversaPedido pedidoId={pedido.id} id="conversa-pedido" iniciais={conversa ?? []} atelie={artesao?.atelie} imagem={artesao?.imagem} />
      </div>
    </Pagina>
  )
}
