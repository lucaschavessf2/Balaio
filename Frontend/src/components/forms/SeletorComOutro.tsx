'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { IconeCheck, IconeEditar, IconeFechar, IconeSetaBaixo } from '@/components/ui/Icones'

const LIMITE_OUTRO = 60

type Props = {
  id: string
  name: string
  opcoes: string[]
  valorInicial?: string
  rotuloOutro: string
  tituloModal: string
  ajudaModal: string
  exemploModal: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

export default function SeletorComOutro({
  id,
  name,
  opcoes,
  valorInicial,
  rotuloOutro,
  tituloModal,
  ajudaModal,
  exemploModal,
  ...aria
}: Props) {
  const prefixo = useId()
  const [valor, definirValor] = useState(valorInicial ?? opcoes[0] ?? '')
  const [personalizado, definirPersonalizado] = useState<string | null>(
    valorInicial && !opcoes.includes(valorInicial) ? valorInicial : null,
  )
  const [aberto, definirAberto] = useState(false)
  const [ativo, definirAtivo] = useState(0)
  const [rascunho, definirRascunho] = useState('')
  const [erroRascunho, definirErroRascunho] = useState<string | null>(null)
  const refRaiz = useRef<HTMLDivElement>(null)
  const refBotao = useRef<HTMLButtonElement>(null)
  const refLista = useRef<HTMLUListElement>(null)
  const refModal = useRef<HTMLDialogElement>(null)
  const refCampoOutro = useRef<HTMLInputElement>(null)

  const itens = personalizado ? [...opcoes, personalizado] : opcoes
  const indiceOutro = itens.length
  const idOpcao = (indice: number) => `${prefixo}-opcao-${indice}`

  useEffect(() => {
    if (!aberto) return
    function fecharAoClicarFora(evento: PointerEvent) {
      if (!refRaiz.current?.contains(evento.target as Node)) definirAberto(false)
    }
    document.addEventListener('pointerdown', fecharAoClicarFora)
    refLista.current?.focus()
    return () => document.removeEventListener('pointerdown', fecharAoClicarFora)
  }, [aberto])

  useEffect(() => {
    if (aberto) document.getElementById(`${prefixo}-opcao-${ativo}`)?.scrollIntoView({ block: 'nearest' })
  }, [aberto, ativo, prefixo])

  function abrirLista() {
    definirAtivo(Math.max(0, itens.indexOf(valor)))
    definirAberto(true)
  }

  function fecharLista() {
    definirAberto(false)
    refBotao.current?.focus()
  }

  function escolher(indice: number) {
    if (indice === indiceOutro) {
      definirAberto(false)
      abrirModal()
      return
    }
    definirValor(itens[indice])
    fecharLista()
  }

  function teclaNoBotao(evento: KeyboardEvent<HTMLButtonElement>) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(evento.key)) {
      evento.preventDefault()
      abrirLista()
    }
  }

  function teclaNaLista(evento: KeyboardEvent<HTMLUListElement>) {
    const ultimo = indiceOutro
    const acoes: Record<string, () => void> = {
      ArrowDown: () => definirAtivo((i) => Math.min(ultimo, i + 1)),
      ArrowUp: () => definirAtivo((i) => Math.max(0, i - 1)),
      Home: () => definirAtivo(0),
      End: () => definirAtivo(ultimo),
      Enter: () => escolher(ativo),
      ' ': () => escolher(ativo),
      Escape: fecharLista,
      Tab: () => definirAberto(false),
    }
    const acao = acoes[evento.key]
    if (!acao) return
    if (evento.key !== 'Tab') evento.preventDefault()
    acao()
  }

  function abrirModal() {
    definirRascunho(personalizado ?? '')
    definirErroRascunho(null)
    refModal.current?.showModal()
    refCampoOutro.current?.focus()
  }

  function fecharModal() {
    refModal.current?.close()
  }

  function confirmarOutro() {
    const texto = rascunho.trim().replace(/\s+/g, ' ')
    if (!texto) {
      definirErroRascunho('Escreva como você quer que apareça')
      refCampoOutro.current?.focus()
      return
    }
    const existente = opcoes.find((opcao) => opcao.toLocaleLowerCase('pt-BR') === texto.toLocaleLowerCase('pt-BR'))
    if (existente) {
      definirValor(existente)
    } else {
      definirPersonalizado(texto)
      definirValor(texto)
    }
    fecharModal()
  }

  function teclaNoCampoOutro(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Enter') {
      evento.preventDefault()
      confirmarOutro()
    }
  }

  function cliqueNoFundoDoModal(evento: MouseEvent<HTMLDialogElement>) {
    if (evento.target === refModal.current) fecharModal()
  }

  return (
    <div className="seletor" ref={refRaiz}>
      <input type="hidden" name={name} value={valor} />

      <button
        type="button"
        id={id}
        ref={refBotao}
        className="seletor-gatilho"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={`${prefixo}-lista`}
        onClick={() => (aberto ? definirAberto(false) : abrirLista())}
        onKeyDown={teclaNoBotao}
        {...aria}
      >
        <span className="seletor-valor">{valor || 'Escolha uma opção'}</span>
        <IconeSetaBaixo tamanho={18} />
      </button>

      {aberto && (
        <ul
          id={`${prefixo}-lista`}
          ref={refLista}
          className="seletor-lista"
          role="listbox"
          tabIndex={-1}
          aria-labelledby={id}
          aria-activedescendant={idOpcao(ativo)}
          onKeyDown={teclaNaLista}
        >
          {itens.map((item, indice) => (
            <li
              key={item}
              id={idOpcao(indice)}
              role="option"
              aria-selected={item === valor}
              className={`seletor-opcao${indice === ativo ? ' seletor-opcao-ativa' : ''}`}
              onPointerEnter={() => definirAtivo(indice)}
              onClick={() => escolher(indice)}
            >
              <span>{item}</span>
              {item === valor && <IconeCheck tamanho={16} />}
            </li>
          ))}
          <li
            id={idOpcao(indiceOutro)}
            role="option"
            aria-selected={false}
            className={`seletor-opcao seletor-opcao-outro${ativo === indiceOutro ? ' seletor-opcao-ativa' : ''}`}
            onPointerEnter={() => definirAtivo(indiceOutro)}
            onClick={() => escolher(indiceOutro)}
          >
            <IconeEditar tamanho={15} />
            <span>{rotuloOutro}</span>
          </li>
        </ul>
      )}

      <dialog
        ref={refModal}
        className="modal"
        aria-labelledby={`${prefixo}-modal-titulo`}
        onClick={cliqueNoFundoDoModal}
        onClose={() => refBotao.current?.focus()}
      >
        <div className="modal-cabecalho">
          <h2 className="modal-titulo" id={`${prefixo}-modal-titulo`}>
            {tituloModal}
          </h2>
          <button type="button" className="modal-fechar" onClick={fecharModal} aria-label="Fechar">
            <IconeFechar tamanho={20} />
          </button>
        </div>

        <div className="campo">
          <label className="campo-rotulo" htmlFor={`${prefixo}-outro`}>
            {ajudaModal}
          </label>
          <input
            id={`${prefixo}-outro`}
            ref={refCampoOutro}
            value={rascunho}
            maxLength={LIMITE_OUTRO}
            placeholder={exemploModal}
            aria-invalid={erroRascunho ? true : undefined}
            aria-describedby={erroRascunho ? `${prefixo}-outro-erro` : undefined}
            onChange={(evento) => definirRascunho(evento.target.value)}
            onKeyDown={teclaNoCampoOutro}
          />
          {erroRascunho && (
            <p className="campo-erro" id={`${prefixo}-outro-erro`}>
              {erroRascunho}
            </p>
          )}
        </div>

        <div className="modal-acoes">
          <button type="button" className="botao botao-fantasma" onClick={fecharModal}>
            Cancelar
          </button>
          <button type="button" className="botao botao-primario" onClick={confirmarOutro}>
            Usar este
          </button>
        </div>
      </dialog>
    </div>
  )
}
