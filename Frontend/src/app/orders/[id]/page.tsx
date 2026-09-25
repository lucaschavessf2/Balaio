import Link from 'next/link'
import { notFound } from 'next/navigation'
import Pagina from '@/components/layout/Pagina'
import ResumoItensPedido from '@/components/pedido/ResumoItensPedido'
import { Migalhas } from '@/components/ui/Basicos'
import ConversaPedido from '@/components/pedido/ConversaPedido'
import BotaoRastreio from '@/components/pedido/BotaoRastreio'
import { IconeAviso, IconeCaminhao, IconeCheck, IconeSetaDireita } from '@/components/ui/Icones'
import { obterPedido, conversaDoPedido } from '@/services/api/pedidos.servico'
import { obterPecaHistorico } from '@/services/api/pecas.servico'
import { obterArtesao } from '@/services/api/artesaos.servico'
import { rotuloEstadoPedido } from '@/constants/rotulos'
import { exigirSessao } from '@/services/autenticacao'
import type { EstadoPedido, EtapaPedido } from '@/types/dominio'
import CancelarPedido from '@/components/pedido/CancelarPedido'

export const dynamic = 'force-dynamic'

const etapasPadrao: { estado: EstadoPedido; titulo: string; pendente: string }[] = [
  { estado: 'confirmado', titulo: 'Pedido confirmado', pendente: 'Aguardando confirmação da compra.' },
  { estado: 'producao', titulo: 'Em produção', pendente: 'O artesão ainda não iniciou esta etapa.' },
  { estado: 'enviado', titulo: 'Enviado', pendente: 'O envio ainda não foi registrado.' },
  { estado: 'entregue', titulo: 'Entregue no seu endereço', pendente: 'A entrega ainda não foi confirmada.' },
]

function linhaDoTempo(estado: EstadoPedido, registradas: EtapaPedido[]): EtapaPedido[] {
  if (['recusado', 'cancelado', 'reembolsado'].includes(estado)) return registradas
  const indiceAtual = etapasPadrao.findIndex((etapa) => etapa.estado === estado)
  return etapasPadrao.map((etapa, indice) => {
    const registrada = registradas.find((item) => item.estado === etapa.estado)
    return {
      estado: etapa.estado,
      titulo: registrada?.titulo ?? etapa.titulo,
      detalhe: registrada?.detalhe ?? (indice === 0 ? 'Compra registrada.' : etapa.pendente),
      concluida: indice < indiceAtual || (indice === indiceAtual && (estado === 'confirmado' || estado === 'entregue')),
      atual: indice === indiceAtual,
      nota: registrada?.nota,
    }
  })
}

export default async function Acompanhamento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { usuario, token } = await exigirSessao()
  const { dados: pedido, erro } = await obterPedido(id, token)
  if (erro && erro.codigo !== 'RECURSO_NAO_ENCONTRADO') throw new Error(erro.mensagem)
  if (!pedido || (pedido.compradorId ?? pedido.usuarioId) !== usuario.id) notFound()

  const { dados: peca } = await obterPecaHistorico(pedido.pecaSlug)
  const artesao = peca ? (await obterArtesao(peca.artesao)).dados : null
  const { dados: conversa } = await conversaDoPedido(id)
  const etapas = linhaDoTempo(pedido.estado, pedido.etapas ?? [])
  const encerrado = ['recusado', 'cancelado', 'reembolsado'].includes(pedido.estado)

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

          {encerrado && (
            <section className="pedido-encerrado abaixo-5" role="status">
              <h2>{rotuloEstadoPedido[pedido.estado].texto}</h2>
              <p>{pedido.motivoEncerramento ?? 'Este pedido foi encerrado.'}</p>
              <p className="campo-ajuda">Se havia uma peça única neste pedido, ela voltou a ficar disponível na vitrine.</p>
            </section>
          )}

          <section className="cartao abaixo-5">
            <h2 className="secao-titulo">Status de produção e entrega</h2>

            <ol className="linha-tempo">
              {etapas.map((etapa) => {
                const etapaEncerrada = ['recusado', 'cancelado', 'reembolsado'].includes(etapa.estado)
                return (
                  <li
                    key={etapa.estado}
                    className={`etapa${etapa.concluida ? ' etapa-feita' : ''}${etapa.atual ? ' etapa-atual' : ''}${etapaEncerrada ? ' etapa-encerrada' : ''}`}
                  >
                    <span className="etapa-marca">
                      {etapaEncerrada ? <IconeAviso tamanho={14} /> : etapa.concluida ? <IconeCheck tamanho={14} /> : etapa.atual ? <IconeCaminhao tamanho={14} /> : null}
                    </span>
                    <div className="encolhivel">
                      <p className="etapa-titulo">
                        {etapa.titulo}
                        {etapa.atual && <span className={`selo ${etapaEncerrada ? 'selo-unica' : 'selo-encomenda'}`}>{etapaEncerrada ? 'Pedido encerrado' : 'Fase atual'}</span>}
                      </p>
                      <p className="etapa-detalhe">{etapa.detalhe}</p>
                      {etapa.nota && (
                        <p className="nota-artesao">
                          <strong>Nota do artesão:</strong> <em>{etapa.nota}</em>
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>

          {!encerrado && <section className="cartao">
            <h2 className="secao-titulo">Informações de envio</h2>
            {!pedido.rastreio && (
              <p className="texto-suave abaixo-3">O código de rastreamento aparece aqui quando o envio for registrado.</p>
            )}
            <div className="grade-dois">
              <div className="dado">
                <span className="dado-rotulo">Código de rastreamento</span>
                <span className="dado-valor preco-destaque">{pedido.rastreio ?? 'Ainda não disponível'}</span>
              </div>
              <div className="dado">
                <span className="dado-rotulo">Transportadora parceira</span>
                <span className="dado-valor">{pedido.transportadora ?? 'A definir'}</span>
              </div>
              <div className="dado">
                <span className="dado-rotulo">Entrega estimada</span>
                <span className="dado-valor" style={{ color: 'var(--verde-tinta)' }}>
                  {pedido.previsaoEntrega ?? 'Aguardando previsão'}
                </span>
              </div>
            </div>
            {pedido.rastreio && (
              <BotaoRastreio
                className="botao botao-secundario acima-4"
                codigo={pedido.rastreio}
                transportadora={pedido.transportadora}
              >
                Acompanhar na transportadora
                <IconeSetaDireita />
              </BotaoRastreio>
            )}
          </section>}

          {pedido.estado === 'entregue' && (
            <section className="cartao acima-5">
              <h2 className="secao-titulo">Sua avaliação</h2>
              <p className="texto-suave abaixo-3">
                {pedido.avaliado ? 'Obrigado por avaliar esta compra.' : 'Conte como foi receber a peça e ajude outros compradores.'}
              </p>
              {!pedido.avaliado && <Link href={`/orders/${pedido.id}/review`} className="botao botao-primario">Avaliar compra</Link>}
            </section>
          )}

          <section className="cartao acima-5">
            <h2 className="secao-titulo">Cancelamento e ajuda</h2>
            {pedido.estado === 'confirmado' ? (
              <>
                <p className="texto-suave abaixo-3">A produção ainda não começou, então você pode cancelar diretamente.</p>
                <CancelarPedido pedidoId={pedido.id} />
              </>
            ) : encerrado ? (
              <p className="texto-suave">O pedido já foi encerrado. Se precisar contestar o resultado, fale com a plataforma.</p>
            ) : (
              <>
                <p className="texto-suave abaixo-3">
                  Como a produção já começou, o cancelamento precisa ser analisado pela plataforma.
                </p>
                <Link href={`/orders/${pedido.id}/mediation`} className="botao botao-fantasma">
                  Solicitar cancelamento pela mediação
                </Link>
              </>
            )}
          </section>
        </div>

        <ConversaPedido pedidoId={pedido.id} id="conversa-pedido" iniciais={conversa ?? []} atelie={artesao?.atelie} imagem={artesao?.imagem} />
      </div>
    </Pagina>
  )
}
