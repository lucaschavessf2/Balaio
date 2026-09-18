'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { IconeBusca } from '@/components/ui/Icones'
import { obterEstado, salvarHistoricoBusca } from '@/services/api/estado.servico'

const LIMITE_HISTORICO = 8

export default function BuscaComSugestoes({
  consultaAtual,
  sugestoes,
}: {
  consultaAtual: string
  sugestoes: string[]
}) {
  const [recentes, definirRecentes] = useState<string[]>([])

  useEffect(() => {
    const termo = consultaAtual.trim().slice(0, 80)
    let vivo = true
    obterEstado().then(({ dados }) => {
      if (!vivo) return
      const atuais = dados?.historicoBusca ?? []
      const proximos = termo ? [termo, ...atuais.filter((t) => t.toLowerCase() !== termo.toLowerCase())].slice(0, LIMITE_HISTORICO) : atuais
      definirRecentes(proximos)
      if (termo) void salvarHistoricoBusca(proximos)
    })
    return () => { vivo = false }
  }, [consultaAtual])

  function limparHistorico() {
    void salvarHistoricoBusca([])
    definirRecentes([])
  }

  return (
    <>
      <form action="/search" role="search" className="cartao busca-destaque">
        <label className="campo-rotulo" htmlFor="busca-pagina">
          O que você procura?
        </label>
        <div className="busca-destaque-linha">
          <input
            id="busca-pagina"
            name="q"
            type="search"
            list="sugestoes-busca"
            defaultValue={consultaAtual}
            placeholder="Ex.: renascença, Tracunhaém, couro"
            className="campo-select"
            enterKeyHint="search"
          />
          <datalist id="sugestoes-busca">
            {sugestoes.map((sugestao) => (
              <option key={sugestao} value={sugestao} />
            ))}
          </datalist>
          <button type="submit" className="botao botao-primario">
            <IconeBusca />
            Buscar
          </button>
        </div>
      </form>

      {recentes.length > 0 && (
        <div className="buscas-recentes">
          <span className="dado-rotulo">Buscas recentes:</span>
          {recentes.map((termo) => (
            <Link key={termo} href={`/search?q=${encodeURIComponent(termo)}`} className="chip-categoria busca-recente">
              <IconeBusca tamanho={14} />
              {termo}
            </Link>
          ))}
          <button type="button" className="botao-texto" onClick={limparHistorico}>
            Limpar histórico
          </button>
        </div>
      )}
    </>
  )
}
