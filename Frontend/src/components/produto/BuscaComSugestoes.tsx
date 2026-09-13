'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { IconeBusca } from '@/components/ui/Icones'

const CHAVE_HISTORICO = 'al-buscas'
const LIMITE_HISTORICO = 8

function lerHistorico(): string[] {
  try {
    const bruto = window.localStorage.getItem(CHAVE_HISTORICO)
    const lista = bruto ? JSON.parse(bruto) : []
    return Array.isArray(lista) ? lista.filter((termo) => typeof termo === 'string') : []
  } catch {
    return []
  }
}

function gravarHistorico(lista: string[]) {
  try {
    window.localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(lista))
  } catch {}
}

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
    const atuais = lerHistorico()
    if (!termo) {
      definirRecentes(atuais)
      return
    }
    const proximos = [termo, ...atuais.filter((t) => t.toLowerCase() !== termo.toLowerCase())].slice(
      0,
      LIMITE_HISTORICO,
    )
    gravarHistorico(proximos)
    definirRecentes(proximos)
  }, [consultaAtual])

  function limparHistorico() {
    gravarHistorico([])
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
