'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import EvidenciasSolicitacao from '@/components/admin/EvidenciasSolicitacao'
import type { SolicitacaoComEvidencias } from '@/components/admin/montarFilaCuradoria'
import { Campo, Retrato } from '@/components/ui/Basicos'
import EstadoVazio from '@/components/feedback/EstadoVazio'
import { avisar } from '@/components/feedback/Avisos'
import { IconeCheck, IconeNovaAba, IconeSelo } from '@/components/ui/Icones'
import { MOTIVO_SEM_PECAS, motivosDeAjuste } from '@/constants/curadoria'
import { decidirSolicitacaoSelo } from '@/services/api/curadoria.servico'

const LIMITE_MOTIVO = 1000
const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Recife' })

function quando(iso: string): string {
  const data = new Date(iso)
  return Number.isNaN(data.getTime()) ? iso : formatoData.format(data)
}

function tempoDeEspera(dias: number): string {
  if (dias === 0) return 'Hoje'
  return dias === 1 ? 'Há 1 dia' : `Há ${dias} dias`
}

function resumoDaFila(fila: SolicitacaoComEvidencias[], verificados: number): string {
  const maisAntiga = fila[0]
  const partes = [
    maisAntiga ? `${fila.length} aguardando` : 'Nenhuma solicitação aguardando',
    maisAntiga && (maisAntiga.diasEsperando === 0
      ? 'a mais antiga é de hoje'
      : `a mais antiga ${tempoDeEspera(maisAntiga.diasEsperando).toLowerCase()}`),
    verificados === 1 ? '1 artesão verificado' : `${verificados} artesãos verificados`,
  ]
  return partes.filter(Boolean).join(' · ')
}

export default function FilaCuradoria({
  filaInicial,
  artesaosVerificados,
}: {
  filaInicial: SolicitacaoComEvidencias[]
  artesaosVerificados: number
}) {
  const roteador = useRouter()
  const [concluidas, definirConcluidas] = useState<string[]>([])
  const [verificados, definirVerificados] = useState(artesaosVerificados)
  const [confirmando, definirConfirmando] = useState<string | null>(null)
  const [ajusteAberto, definirAjusteAberto] = useState<string | null>(null)
  const [motivo, definirMotivo] = useState('')
  const [erroMotivo, definirErroMotivo] = useState('')
  const [processando, definirProcessando] = useState<string[]>([])
  const emAndamento = useRef(new Set<string>())
  const solicitacoesConcluidas = useRef(new Set<string>())
  const fila = filaInicial.filter((item) => !concluidas.includes(item.id))

  function iniciarAtualizacao(id: string) {
    if (emAndamento.current.has(id) || solicitacoesConcluidas.current.has(id)) return false
    emAndamento.current.add(id)
    definirProcessando((atuais) => [...atuais, id])
    return true
  }

  function finalizarAtualizacao(id: string) {
    emAndamento.current.delete(id)
    definirProcessando((atuais) => atuais.filter((atual) => atual !== id))
  }

  function tirarDaFila(item: SolicitacaoComEvidencias) {
    solicitacoesConcluidas.current.add(item.id)
    definirConcluidas((atuais) => [...atuais, item.id])
    definirAjusteAberto((atual) => atual === item.id ? null : atual)
    definirConfirmando((atual) => atual === item.id ? null : atual)
    roteador.refresh()
  }

  async function conceder(item: SolicitacaoComEvidencias) {
    if (!iniciarAtualizacao(item.id)) return
    try {
      const resposta = await decidirSolicitacaoSelo(item.id, 'aprovada')
      if (resposta.erro || !resposta.dados) { avisar.erro('Não foi possível conceder o selo', resposta.erro?.mensagem); return }
      tirarDaFila(item)
      definirVerificados((n) => n + 1)
      avisar.sucesso('Selo de verificado concedido', `${item.atelie}, de ${item.artesao}.`)
    } catch {
      avisar.erro('Não foi possível conceder o selo', 'Tente novamente.')
    } finally {
      finalizarAtualizacao(item.id)
    }
  }

  async function pedirAjuste(item: SolicitacaoComEvidencias) {
    if (!motivo.trim()) {
      definirErroMotivo('Explique ao artesão o que precisa ser ajustado')
      document.getElementById(`motivo-${item.id}`)?.focus()
      return
    }
    if (!iniciarAtualizacao(item.id)) return
    try {
      const resposta = await decidirSolicitacaoSelo(item.id, 'ajuste', motivo)
      if (resposta.erro || !resposta.dados) { avisar.erro('Não foi possível registrar', resposta.erro?.mensagem); return }
      tirarDaFila(item)
      avisar.info('Pedido de ajuste enviado', `${item.artesao} vê o motivo no painel e continua vendendo normalmente.`)
    } catch {
      avisar.erro('Não foi possível registrar', 'Seu motivo foi mantido. Tente novamente.')
    } finally {
      finalizarAtualizacao(item.id)
    }
  }

  function abrirConfirmacao(id: string) {
    if (emAndamento.current.has(id) || solicitacoesConcluidas.current.has(id)) return
    definirAjusteAberto(null)
    definirConfirmando(id)
  }

  function abrirAjuste(item: SolicitacaoComEvidencias) {
    if (emAndamento.current.has(item.id) || solicitacoesConcluidas.current.has(item.id)) return
    definirConfirmando(null)
    definirAjusteAberto(item.id)
    definirMotivo(item.pecas.length === 0 ? MOTIVO_SEM_PECAS : '')
    definirErroMotivo('')
  }

  function alternarMotivo(texto: string) {
    definirMotivo((atual) => atual.includes(texto)
      ? atual.replace(texto, '').replace(/\n{2,}/g, '\n').trim()
      : [atual.trim(), texto].filter(Boolean).join('\n'))
    definirErroMotivo('')
  }

  return (
    <>
      <p className="subtitulo-pagina">{resumoDaFila(fila, verificados)}</p>

      <section aria-labelledby="fila-curadoria-titulo">
        <h2 className="so-leitor" id="fila-curadoria-titulo">Artesãos aguardando o selo de verificado</h2>

        {fila.length === 0 ? (
          <EstadoVazio
            icone={<IconeSelo tamanho={34} />}
            titulo="Fila de curadoria em dia"
            descricao="Todas as solicitações de selo foram analisadas. As próximas aparecem aqui assim que chegarem."
          />
        ) : (
          <ul className="lista-curadoria escalonado">
            {fila.map((item) => {
              const ocupado = processando.includes(item.id)
              const temPecas = item.pecas.length > 0
              return (
                <li className="cartao-curadoria" key={item.id}>
                  <header className="cartao-curadoria-topo">
                    <div className="cartao-curadoria-identidade">
                      <Retrato imagem={item.imagem} tamanho={48} />
                      <div className="encolhivel">
                        <p className="cartao-curadoria-peca">{item.atelie}</p>
                        <p className="autoria">
                          {[item.artesao, item.territorio, item.tecnica].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <span className="selo selo-encomenda" title={`${item.id} · ${quando(item.solicitadoEm)}`}>
                      {tempoDeEspera(item.diasEsperando)}
                    </span>
                  </header>

                  <div className="cartao-curadoria-corpo">
                    <EvidenciasSolicitacao item={item} />

                    {item.mensagem && (
                      <p className="texto-suave acima-3">
                        <strong>Mensagem do artesão:</strong> {item.mensagem}
                      </p>
                    )}

                    {ajusteAberto === item.id && (
                      <div className="acima-3">
                        <div className="chips-filtro abaixo-2" role="group" aria-label="Motivos frequentes">
                          {motivosDeAjuste.map((texto) => {
                            const ativo = motivo.includes(texto)
                            return (
                              <button
                                key={texto}
                                type="button"
                                className={`chip-filtro${ativo ? ' chip-filtro-ativo' : ''}`}
                                aria-pressed={ativo}
                                disabled={ocupado}
                                onClick={() => alternarMotivo(texto)}
                              >
                                {texto}
                              </button>
                            )
                          })}
                        </div>
                        <Campo
                          rotulo="O que precisa ser ajustado?"
                          ajuda="O artesão vê este texto no painel. Ele pode continuar vendendo enquanto ajusta."
                          erro={erroMotivo}
                          id={`motivo-${item.id}`}
                        >
                          <textarea
                            id={`motivo-${item.id}`}
                            maxLength={LIMITE_MOTIVO}
                            disabled={ocupado}
                            value={motivo}
                            onChange={(evento) => {
                              definirMotivo(evento.target.value)
                              if (erroMotivo) definirErroMotivo('')
                            }}
                          />
                        </Campo>
                      </div>
                    )}
                  </div>

                  <footer className="acoes-linha acoes-empilhaveis cartao-curadoria-acoes">
                    {ajusteAberto === item.id && (
                      <>
                        <button type="button" className="botao botao-primario" disabled={ocupado} onClick={() => pedirAjuste(item)}>
                          Enviar pedido de ajuste
                        </button>
                        <button type="button" className="botao botao-fantasma" disabled={ocupado} onClick={() => definirAjusteAberto(null)}>
                          Cancelar
                        </button>
                      </>
                    )}

                    {confirmando === item.id && (
                      <>
                        <p className="cartao-curadoria-pergunta">Conceder o selo de verificado a {item.atelie}?</p>
                        <button type="button" className="botao botao-sucesso" disabled={ocupado} autoFocus onClick={() => conceder(item)}>
                          <IconeCheck />
                          Confirmar selo
                        </button>
                        <button type="button" className="botao botao-fantasma" disabled={ocupado} onClick={() => definirConfirmando(null)}>
                          Cancelar
                        </button>
                      </>
                    )}

                    {ajusteAberto !== item.id && confirmando !== item.id && (
                      <>
                        {temPecas && (
                          <button type="button" className="botao botao-sucesso" disabled={ocupado} onClick={() => abrirConfirmacao(item.id)}>
                            <IconeCheck />
                            Conceder selo
                          </button>
                        )}
                        <button type="button" className="botao botao-fantasma" disabled={ocupado} onClick={() => abrirAjuste(item)}>
                          Pedir ajuste
                        </button>
                        <Link href={`/artisans/${item.artesaoSlug}`} target="_blank" rel="noopener noreferrer" className="botao botao-fantasma">
                          Ver perfil
                          <IconeNovaAba />
                          <span className="so-leitor">(abre em nova aba)</span>
                        </Link>
                        {!temPecas && <p className="campo-ajuda">O selo exige ao menos uma peça publicada.</p>}
                      </>
                    )}
                  </footer>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}
