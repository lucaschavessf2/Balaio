'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { IconeCheck, IconeSetaBaixo } from '@/components/ui/Icones'

export type OpcaoSeletor = { valor: string; rotulo: string }

type Props = {
  id?: string
  name?: string
  opcoes: readonly (string | OpcaoSeletor)[]
  value?: string
  defaultValue?: string
  onChange?: (valor: string) => void
  disabled?: boolean
  compacto?: boolean
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

const ALTURA_MAXIMA_LISTA = 256
const ALTURA_MINIMA_LISTA = 140
const ALTURA_OPCAO = 44
const FOLGA_INFERIOR = 72
const FOLGA_SUPERIOR = 8
const TEMPO_BUSCA_MS = 600

const comoOpcao = (opcao: string | OpcaoSeletor): OpcaoSeletor =>
  typeof opcao === 'string' ? { valor: opcao, rotulo: opcao } : opcao

const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')

function calcularPosicao(gatilho: HTMLElement, totalOpcoes: number) {
  const caixa = gatilho.getBoundingClientRect()
  const cabecalho = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cabecalho-espaco')) || 0
  const espacoAbaixo = window.innerHeight - caixa.bottom - FOLGA_INFERIOR
  const espacoAcima = caixa.top - cabecalho - FOLGA_SUPERIOR
  const alturaDesejada = Math.min(ALTURA_MAXIMA_LISTA, totalOpcoes * ALTURA_OPCAO + 12)
  const acima = espacoAbaixo < alturaDesejada && espacoAcima > espacoAbaixo
  const espaco = acima ? espacoAcima : espacoAbaixo
  return { acima, alturaMaxima: Math.max(ALTURA_MINIMA_LISTA, Math.min(ALTURA_MAXIMA_LISTA, espaco)) }
}

export default function Seletor({
  id,
  name,
  opcoes,
  value,
  defaultValue,
  onChange,
  disabled = false,
  compacto = false,
  className,
  'aria-label': rotuloAria,
  'aria-labelledby': rotuladoPor,
  'aria-describedby': descritoPor,
  'aria-invalid': invalido,
}: Props) {
  const prefixo = useId()
  const itens = opcoes.map(comoOpcao)
  const valorInicial = itens.some((item) => item.valor === defaultValue) ? defaultValue! : itens[0]?.valor ?? ''
  const [interno, definirInterno] = useState(valorInicial)
  const [aberto, definirAberto] = useState(false)
  const [ativo, definirAtivo] = useState(0)
  const [posicao, definirPosicao] = useState({ acima: false, alturaMaxima: ALTURA_MAXIMA_LISTA })
  const refRaiz = useRef<HTMLDivElement>(null)
  const refGatilho = useRef<HTMLButtonElement>(null)
  const refLista = useRef<HTMLUListElement>(null)
  const refBusca = useRef('')
  const refTempoBusca = useRef<number | undefined>(undefined)

  const controlado = value !== undefined
  const valor = controlado ? value : interno
  const indiceSelecionado = itens.findIndex((item) => item.valor === valor)
  const idLista = `${prefixo}-lista`
  const idOpcao = (indice: number) => `${prefixo}-opcao-${indice}`

  useEffect(() => {
    if (!aberto) return
    function fecharAoTocarFora(evento: PointerEvent) {
      if (!refRaiz.current?.contains(evento.target as Node)) definirAberto(false)
    }
    document.addEventListener('pointerdown', fecharAoTocarFora)
    return () => document.removeEventListener('pointerdown', fecharAoTocarFora)
  }, [aberto])

  useEffect(() => {
    const lista = refLista.current
    const opcao = lista?.children[ativo] as HTMLElement | undefined
    if (!aberto || !lista || !opcao) return
    if (opcao.offsetTop < lista.scrollTop) lista.scrollTop = opcao.offsetTop
    else if (opcao.offsetTop + opcao.offsetHeight > lista.scrollTop + lista.clientHeight) {
      lista.scrollTop = opcao.offsetTop + opcao.offsetHeight - lista.clientHeight
    }
  }, [aberto, ativo])

  useEffect(() => {
    const formulario = refRaiz.current?.closest('form')
    if (!formulario) return
    const restaurar = () => definirInterno(valorInicial)
    formulario.addEventListener('reset', restaurar)
    return () => formulario.removeEventListener('reset', restaurar)
  }, [valorInicial])

  function abrir() {
    if (refGatilho.current) definirPosicao(calcularPosicao(refGatilho.current, itens.length))
    definirAtivo(Math.max(0, indiceSelecionado))
    definirAberto(true)
  }

  function escolher(indice: number) {
    const item = itens[indice]
    definirAberto(false)
    refGatilho.current?.focus()
    if (!item || item.valor === valor) return
    if (!controlado) definirInterno(item.valor)
    onChange?.(item.valor)
  }

  function buscarPorTexto(letra: string, indiceBase: number) {
    window.clearTimeout(refTempoBusca.current)
    refBusca.current += normalizar(letra)
    refTempoBusca.current = window.setTimeout(() => { refBusca.current = '' }, TEMPO_BUSCA_MS)
    const inicio = refBusca.current.length === 1 ? indiceBase + 1 : indiceBase
    const ordem = [...itens.slice(inicio), ...itens.slice(0, inicio)]
    const achado = ordem.find((item) => normalizar(item.rotulo).startsWith(refBusca.current))
    if (achado) definirAtivo(itens.indexOf(achado))
  }

  function aoTeclar(evento: KeyboardEvent<HTMLButtonElement>) {
    if (evento.ctrlKey || evento.metaKey || evento.altKey) return
    const letra = evento.key.length === 1 && (evento.key !== ' ' || refBusca.current) ? evento.key : null

    if (!aberto) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(evento.key)) {
        evento.preventDefault()
        abrir()
      } else if (letra) {
        abrir()
        buscarPorTexto(letra, Math.max(0, indiceSelecionado))
      }
      return
    }

    if (letra) {
      evento.preventDefault()
      buscarPorTexto(letra, ativo)
      return
    }

    const ultimo = itens.length - 1
    const acoes: Record<string, () => void> = {
      ArrowDown: () => definirAtivo((indice) => Math.min(ultimo, indice + 1)),
      ArrowUp: () => definirAtivo((indice) => Math.max(0, indice - 1)),
      Home: () => definirAtivo(0),
      End: () => definirAtivo(ultimo),
      Enter: () => escolher(ativo),
      ' ': () => escolher(ativo),
      Escape: () => definirAberto(false),
      Tab: () => escolher(ativo),
    }
    const acao = acoes[evento.key]
    if (!acao) return
    if (evento.key !== 'Tab') evento.preventDefault()
    acao()
  }

  return (
    <div className={['seletor', compacto && 'seletor-compacto', className].filter(Boolean).join(' ')} ref={refRaiz}>
      {name && <input type="hidden" name={name} value={valor} disabled={disabled} />}

      <button
        type="button"
        id={id}
        ref={refGatilho}
        role="combobox"
        className="seletor-gatilho"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={idLista}
        aria-activedescendant={aberto && itens[ativo] ? idOpcao(ativo) : undefined}
        aria-label={rotuloAria}
        aria-labelledby={rotuladoPor}
        aria-describedby={descritoPor}
        aria-invalid={invalido}
        onClick={() => (aberto ? definirAberto(false) : abrir())}
        onKeyDown={aoTeclar}
        onKeyUp={(evento) => { if (evento.key === ' ') evento.preventDefault() }}
        onBlur={() => definirAberto(false)}
      >
        <span className="seletor-valor">{itens[indiceSelecionado]?.rotulo ?? valor}</span>
        <IconeSetaBaixo tamanho={18} />
      </button>

      {aberto && (
        <ul
          id={idLista}
          ref={refLista}
          className={`seletor-lista${posicao.acima ? ' seletor-lista-acima' : ''}`}
          style={{ maxHeight: posicao.alturaMaxima }}
          role="listbox"
          aria-label={rotuloAria}
          aria-labelledby={rotuladoPor ?? (rotuloAria ? undefined : id)}
          onMouseDown={(evento) => evento.preventDefault()}
        >
          {itens.map((item, indice) => (
            <li
              key={item.valor}
              id={idOpcao(indice)}
              role="option"
              aria-selected={item.valor === valor}
              className={`seletor-opcao${indice === ativo ? ' seletor-opcao-ativa' : ''}`}
              onPointerEnter={() => definirAtivo(indice)}
              onClick={() => escolher(indice)}
            >
              <span>{item.rotulo}</span>
              {item.valor === valor && <IconeCheck tamanho={16} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
