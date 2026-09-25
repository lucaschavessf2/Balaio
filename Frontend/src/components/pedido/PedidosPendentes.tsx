'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState, type FormEvent } from 'react'
import { Campo, EstadoVazio, Foto } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { IconeAviso, IconeFechar, IconePacote } from '@/components/ui/Icones'
import { emReais } from '@/utils/formato'
import { atualizarEstadoPedido, recusarPedido } from '@/services/api/pedidos.servico'
import { avisarPainelAtualizado } from '@/hooks/useArtesaoLogado'

export type PedidoPendente = {
  id: string
  comprador: string
  quando: string
  valor: number
  pecaNome?: string
  pecaTecnica?: string
  pecaImagem?: string
}

export default function PedidosPendentes({
  iniciais,
  faturamentoMes,
  emProducao,
  pecasAtivas,
  avisosPecas,
}: {
  iniciais: PedidoPendente[]
  faturamentoMes: number
  emProducao: number
  pecasAtivas: number
  avisosPecas: { slug: string; nome: string; motivo: string }[]
}) {
  const roteador = useRouter()
  const dialogoRecusa = useRef<HTMLDialogElement>(null)
  const [pendentes, definirPendentes] = useState(iniciais)
  const [pedidoRecusado, definirPedidoRecusado] = useState<PedidoPendente | null>(null)
  const [motivo, definirMotivo] = useState('')
  const [erroMotivo, definirErroMotivo] = useState<string | null>(null)
  const [salvando, definirSalvando] = useState(false)

  const metricas = [
    {
      rotulo: 'Pedidos pendentes',
      valor: String(pendentes.length),
      nota: 'Aguardando aceitação',
      classe: 'metrica-amarela',
    },
    { rotulo: 'Em produção', valor: String(emProducao), nota: 'Nas bancadas e fornos', classe: 'metrica-azul' },
    { rotulo: 'Peças ativas', valor: String(pecasAtivas), nota: 'Publicadas na vitrine', classe: 'metrica-verde' },
    {
      rotulo: 'Faturamento do mês',
      valor: emReais(faturamentoMes),
      nota: 'Pedidos registrados neste mês',
      classe: 'metrica-branca',
    },
  ]

  async function aceitar(pedido: PedidoPendente) {
    const resposta = await atualizarEstadoPedido(pedido.id, 'producao')
    if (!resposta.dados) return avisar.erro('Não foi possível aceitar', resposta.erro?.mensagem)
    definirPendentes(pendentes.filter((p) => p.id !== pedido.id))
    avisarPainelAtualizado()
    roteador.refresh()
    avisar.sucesso('Pedido aceito', 'Combine o prazo com o comprador pela conversa.')
  }

  function abrirRecusa(pedido: PedidoPendente) {
    definirPedidoRecusado(pedido)
    definirMotivo('')
    definirErroMotivo(null)
    dialogoRecusa.current?.showModal()
  }

  async function confirmarRecusa(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!pedidoRecusado || salvando) return
    const texto = motivo.trim()
    if (texto.length < 5) {
      definirErroMotivo('Explique brevemente por que você não consegue atender este pedido')
      return
    }
    definirSalvando(true)
    const resposta = await recusarPedido(pedidoRecusado.id, texto)
    definirSalvando(false)
    if (!resposta.dados) return avisar.erro('Não foi possível recusar', resposta.erro?.mensagem)
    definirPendentes((atuais) => atuais.filter((pedido) => pedido.id !== pedidoRecusado.id))
    dialogoRecusa.current?.close()
    avisarPainelAtualizado()
    roteador.refresh()
    avisar.info('Pedido recusado', 'O comprador verá o motivo e a peça única, se houver, voltou à vitrine.')
  }

  return (
    <>
      {avisosPecas.length > 0 && (
        <section className="painel-alertas" aria-labelledby="alertas-estoque">
          <div className="painel-alertas-icone"><IconeAviso tamanho={22} /></div>
          <div>
            <h2 id="alertas-estoque">Atenção à sua vitrine</h2>
            <ul>
              {avisosPecas.map((peca) => (
                <li key={`${peca.slug}-${peca.motivo}`}>
                  <strong>{peca.nome}</strong> · {peca.motivo}
                </li>
              ))}
            </ul>
            <Link href="/dashboard/pieces">Revisar minhas peças</Link>
          </div>
        </section>
      )}

      <div className="metricas">
        {metricas.map((m) => (
          <div className={`metrica ${m.classe}`} key={m.rotulo}>
            <p className="metrica-rotulo">{m.rotulo}</p>
            <p className="metrica-valor">{m.valor}</p>
            <p className="metrica-nota">{m.nota}</p>
          </div>
        ))}
      </div>

      <section className="secao">
        <h2 className="secao-titulo">Novos pedidos recebidos</h2>

        {pendentes.length === 0 && (
          <EstadoVazio
            icone={<IconePacote tamanho={34} />}
            titulo="Nenhum pedido aguardando"
            descricao="Você aceitou todos os pedidos novos. Os próximos aparecem aqui assim que chegarem."
          />
        )}

        {pendentes.map((pedido) => (
          <article className="linha-pedido" key={pedido.id}>
            <div className="linha-flex encolhivel" style={{ flexWrap: 'nowrap' }}>
              <div className="linha-pedido-figura">
                {pedido.pecaImagem && <Foto nome={pedido.pecaNome ?? ''} imagem={pedido.pecaImagem} decorativa />}
              </div>
              <div className="encolhivel">
                <p className="dado-valor">{pedido.pecaNome}</p>
                <p className="autoria">Técnica: {pedido.pecaTecnica}</p>
              </div>
            </div>

            <div className="dado">
              <span className="dado-rotulo">Comprador</span>
              <span className="dado-valor">{pedido.comprador}</span>
            </div>

            <div className="dado">
              <span className="dado-rotulo">Recebido</span>
              <span className="dado-valor">{pedido.quando}</span>
            </div>

            <div className="dado">
              <span className="dado-rotulo">Valor</span>
              <span className="dado-valor preco-destaque">{emReais(pedido.valor)}</span>
            </div>

            <div className="acoes-linha">
              <span className="selo selo-encomenda">
                <span className="selo-ponto" />
                Pendente
              </span>
              <button type="button" className="botao botao-sucesso" onClick={() => aceitar(pedido)}>
                Aceitar pedido
              </button>
              <button type="button" className="botao botao-fantasma" onClick={() => abrirRecusa(pedido)}>
                Recusar
              </button>
            </div>
          </article>
        ))}
      </section>

      <dialog className="modal" ref={dialogoRecusa} aria-labelledby="recusa-titulo">
        <div className="modal-cabecalho">
          <h2 className="modal-titulo" id="recusa-titulo">Recusar pedido</h2>
          <button type="button" className="modal-fechar" aria-label="Fechar" onClick={() => dialogoRecusa.current?.close()}>
            <IconeFechar tamanho={20} />
          </button>
        </div>
        <form onSubmit={confirmarRecusa}>
          <p className="texto-suave abaixo-4">
            {pedidoRecusado?.pecaNome}. O comprador verá a justificativa e será avisado sobre o cancelamento.
          </p>
          <Campo rotulo="Motivo da recusa" ajuda="Seja direto e cordial." erro={erroMotivo ?? undefined} id="motivo-recusa">
            <textarea id="motivo-recusa" value={motivo} maxLength={500} onChange={(evento) => definirMotivo(evento.target.value)} />
          </Campo>
          <div className="modal-acoes">
            <button type="button" className="botao botao-fantasma" onClick={() => dialogoRecusa.current?.close()}>Voltar</button>
            <button type="submit" className="botao botao-perigo" disabled={salvando}>{salvando ? 'Recusando…' : 'Confirmar recusa'}</button>
          </div>
        </form>
      </dialog>
    </>
  )
}
