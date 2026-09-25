'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Campo, Retrato } from '@/components/ui/Basicos'
import EstadoVazio from '@/components/feedback/EstadoVazio'
import { avisar } from '@/components/feedback/Avisos'
import { IconeCheck, IconeSelo } from '@/components/ui/Icones'
import { decidirSolicitacaoSelo } from '@/services/api/curadoria.servico'
import type { SolicitacaoSeloNaFila } from '@/types/dominio'

const LIMITE_MOTIVO = 1000
const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Recife' })

function quando(iso: string): string {
  const data = new Date(iso)
  return Number.isNaN(data.getTime()) ? iso : formatoData.format(data)
}

export default function FilaCuradoria({
  filaInicial,
  mediacoesAbertas,
  artesaosVerificados,
}: {
  filaInicial: SolicitacaoSeloNaFila[]
  mediacoesAbertas: number
  artesaosVerificados: number
}) {
  const roteador = useRouter()
  const [fila, definirFila] = useState(filaInicial)
  const [analisadas, definirAnalisadas] = useState(0)
  const [verificados, definirVerificados] = useState(artesaosVerificados)
  const [ajusteAberto, definirAjusteAberto] = useState<string | null>(null)
  const [motivo, definirMotivo] = useState('')
  const [erroMotivo, definirErroMotivo] = useState('')
  const [processando, definirProcessando] = useState<string | null>(null)

  const metricas = [
    { rotulo: 'Na fila', valor: String(fila.length), nota: 'Aguardando análise', classe: 'metrica-amarela' },
    { rotulo: 'Analisadas agora', valor: String(analisadas), nota: 'Nesta sessão', classe: 'metrica-verde' },
    { rotulo: 'Artesãos verificados', valor: String(verificados), nota: 'Com selo ativo', classe: 'metrica-azul' },
    { rotulo: 'Mediações abertas', valor: String(mediacoesAbertas), nota: 'Exigem resposta em 48h', classe: 'metrica-branca' },
  ]

  function tirarDaFila(item: SolicitacaoSeloNaFila) {
    definirFila((atual) => atual.filter((f) => f.id !== item.id))
    definirAnalisadas((n) => n + 1)
    definirAjusteAberto(null)
    definirMotivo('')
    roteador.refresh()
  }

  async function conceder(item: SolicitacaoSeloNaFila) {
    definirProcessando(item.id)
    const resposta = await decidirSolicitacaoSelo(item.id, 'aprovada')
    definirProcessando(null)
    if (resposta.erro) { avisar.erro('Não foi possível conceder o selo', resposta.erro.mensagem); return }
    tirarDaFila(item)
    definirVerificados((n) => n + 1)
    avisar.sucesso('Selo de verificado concedido', `${item.atelie}, de ${item.artesao}.`)
  }

  async function pedirAjuste(item: SolicitacaoSeloNaFila) {
    if (!motivo.trim()) {
      definirErroMotivo('Explique ao artesão o que precisa ser ajustado')
      document.getElementById(`motivo-${item.id}`)?.focus()
      return
    }
    definirProcessando(item.id)
    const resposta = await decidirSolicitacaoSelo(item.id, 'ajuste', motivo)
    definirProcessando(null)
    if (resposta.erro) { avisar.erro('Não foi possível registrar', resposta.erro.mensagem); return }
    tirarDaFila(item)
    avisar.info('Pedido de ajuste enviado', `${item.artesao} vê o motivo no painel e continua vendendo normalmente.`)
  }

  function abrirAjuste(id: string) {
    definirAjusteAberto(id)
    definirMotivo('')
    definirErroMotivo('')
  }

  return (
    <>
      <div className="metricas metricas-duplas">
        {metricas.map((m) => (
          <div className={`metrica ${m.classe}`} key={m.rotulo}>
            <p className="metrica-rotulo">{m.rotulo}</p>
            <p className="metrica-valor">{m.valor}</p>
            <p className="metrica-nota">{m.nota}</p>
          </div>
        ))}
      </div>

      <section className="secao">
        <h2 className="secao-titulo">Artesãos aguardando o selo de verificado</h2>

        {fila.length === 0 ? (
          <EstadoVazio
            icone={<IconeSelo tamanho={34} />}
            titulo="Fila de curadoria em dia"
            descricao="Todas as solicitações de selo foram analisadas. As próximas aparecem aqui assim que chegarem."
          />
        ) : (
          <ul className="lista-curadoria">
            {fila.map((item) => {
              const ocupado = processando === item.id
              return (
                <li className="cartao-curadoria" key={item.id}>
                  <header className="cartao-curadoria-topo">
                    <span className="selo selo-encomenda">
                      <span className="selo-ponto" />
                      Aguardando análise
                    </span>
                    <span className="dado-rotulo">
                      {item.id} · {quando(item.solicitadoEm)}
                    </span>
                  </header>

                  <div className="cartao-curadoria-corpo">
                    <div className="linha-flex" style={{ flexWrap: 'nowrap', gap: 12 }}>
                      <Retrato imagem={item.imagem} tamanho={48} />
                      <div className="encolhivel">
                        <p className="cartao-curadoria-peca">{item.atelie}</p>
                        <p className="autoria">
                          {[item.artesao, item.territorio, item.tecnica].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>

                    <p className="campo-ajuda acima-3">
                      {item.pecasPublicadas === 1 ? '1 peça publicada' : `${item.pecasPublicadas} peças publicadas`} na loja.
                    </p>
                    {item.mensagem && (
                      <p className="texto-suave acima-3">
                        <strong>Mensagem do artesão:</strong> {item.mensagem}
                      </p>
                    )}

                    {ajusteAberto === item.id && (
                      <div className="acima-3">
                        <Campo
                          rotulo="O que precisa ser ajustado?"
                          ajuda="O artesão vê este texto no painel. Ele pode continuar vendendo enquanto ajusta."
                          erro={erroMotivo}
                          id={`motivo-${item.id}`}
                        >
                          <textarea
                            id={`motivo-${item.id}`}
                            maxLength={LIMITE_MOTIVO}
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
                    {ajusteAberto === item.id ? (
                      <>
                        <button type="button" className="botao botao-primario" disabled={ocupado} onClick={() => pedirAjuste(item)}>
                          Enviar pedido de ajuste
                        </button>
                        <button type="button" className="botao botao-fantasma" disabled={ocupado} onClick={() => definirAjusteAberto(null)}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="botao botao-sucesso" disabled={ocupado} onClick={() => conceder(item)}>
                          <IconeCheck />
                          Conceder selo
                        </button>
                        <button type="button" className="botao botao-fantasma" disabled={ocupado} onClick={() => abrirAjuste(item.id)}>
                          Pedir ajuste
                        </button>
                        <Link href={`/artisans/${item.artesaoSlug}`} className="botao botao-fantasma">
                          Ver perfil
                        </Link>
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
