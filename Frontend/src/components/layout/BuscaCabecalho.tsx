'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { IconeBusca, IconeRelogio } from '@/components/ui/Icones'
import { obterEstado, salvarHistoricoBusca } from '@/services/api/estado.servico'

const LIMITE_HISTORICO = 8
const LIMITE_SUGESTOES = 8

const normalizarTermo = (valor: string) =>
  valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function BuscaCabecalho({ sugestoes }: { sugestoes: string[] }) {
  const raiz = useRef<HTMLDivElement>(null)
  const parametros = useSearchParams()
  const [consulta, definirConsulta] = useState('')
  const [recentes, definirRecentes] = useState<string[]>([])
  const [aberto, definirAberto] = useState(false)

  useEffect(() => {
    definirConsulta(parametros.get('q') ?? '')
  }, [parametros])

  useEffect(() => {
    let vivo = true
    obterEstado().then(({ dados }) => {
      if (vivo) definirRecentes(dados?.historicoBusca ?? [])
    })
    return () => { vivo = false }
  }, [])

  useEffect(() => {
    function fecharAoClicarFora(evento: PointerEvent) {
      if (raiz.current && !raiz.current.contains(evento.target as Node)) definirAberto(false)
    }

    document.addEventListener('pointerdown', fecharAoClicarFora)
    return () => document.removeEventListener('pointerdown', fecharAoClicarFora)
  }, [])

  const termoNormalizado = normalizarTermo(consulta.trim())
  const sugestoesVisiveis = useMemo(() => {
    if (!termoNormalizado) return []
    return sugestoes
      .filter((sugestao) => normalizarTermo(sugestao).includes(termoNormalizado))
      .slice(0, LIMITE_SUGESTOES)
  }, [sugestoes, termoNormalizado])

  const mostrarHistorico = !consulta.trim()
  const mostrarPainel = aberto && (mostrarHistorico ? recentes.length > 0 : true)

  function registrarBusca() {
    const termo = consulta.trim().slice(0, 80)
    if (!termo) return
    const proximos = [termo, ...recentes.filter((item) => item.toLowerCase() !== termo.toLowerCase())].slice(0, LIMITE_HISTORICO)
    definirRecentes(proximos)
    void salvarHistoricoBusca(proximos)
    definirAberto(false)
  }

  function limparHistorico() {
    definirRecentes([])
    void salvarHistoricoBusca([])
  }

  function selecionarBusca(termo: string) {
    const proximos = [termo, ...recentes.filter((item) => item.toLowerCase() !== termo.toLowerCase())].slice(0, LIMITE_HISTORICO)
    definirRecentes(proximos)
    void salvarHistoricoBusca(proximos)
    definirAberto(false)
  }

  return (
    <div ref={raiz} className="cabecalho-busca">
      <form action="/search" role="search" onSubmit={registrarBusca}>
        <button type="submit" className="cabecalho-busca-botao" aria-label="Buscar">
          <IconeBusca />
        </button>
        <label className="so-leitor" htmlFor="busca-topo">Buscar peças</label>
        <input
          id="busca-topo"
          name="q"
          type="search"
          value={consulta}
          placeholder="Buscar técnica, artesão, território..."
          autoComplete="off"
          onChange={(evento) => {
            definirConsulta(evento.currentTarget.value)
            definirAberto(true)
          }}
          onFocus={() => definirAberto(true)}
          onKeyDown={(evento) => {
            if (evento.key === 'Escape') {
              definirAberto(false)
              evento.currentTarget.blur()
            }
          }}
        />
      </form>

      {mostrarPainel && (
        <div className="cabecalho-busca-painel" role="region" aria-label={mostrarHistorico ? 'Buscas recentes' : 'Sugestões de busca'}>
          {mostrarHistorico ? (
            <>
              <div className="cabecalho-busca-cabecalho">
                <span>Buscas recentes</span>
                <button type="button" onClick={limparHistorico}>Limpar histórico</button>
              </div>
              <ul>
                {recentes.map((termo) => (
                  <li key={termo}>
                    <Link href={`/search?q=${encodeURIComponent(termo)}`} onClick={() => selecionarBusca(termo)}>
                      <IconeRelogio tamanho={15} />
                      <span>{termo}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className="cabecalho-busca-cabecalho"><span>Sugestões</span></div>
              {sugestoesVisiveis.length > 0 ? (
                <ul>
                  {sugestoesVisiveis.map((sugestao) => (
                    <li key={sugestao}>
                            <Link href={`/search?q=${encodeURIComponent(sugestao)}`} onClick={() => selecionarBusca(sugestao)}>
                        <IconeBusca tamanho={15} />
                        <span>{sugestao}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma sugestão. Pressione Enter para buscar por “{consulta.trim()}”.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}