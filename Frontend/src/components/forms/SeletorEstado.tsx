'use client'

import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ESTADOS_BRASILEIROS } from '@/constants/estados'
import { IconeCheck, IconeSetaBaixo } from '@/components/ui/Icones'

function normalizar(valor: string) {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
}

export default function SeletorEstado({
  id,
  value,
  erro,
  onChange,
}: {
  id: string
  value: string
  erro?: string
  onChange: (valor: string) => void
}) {
  const [aberto, definirAberto] = useState(false)
  const [indiceAtivo, definirIndiceAtivo] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const idLista = `${id}-opcoes`
  const idAjuda = `${id}-ajuda`
  const idErro = erro ? `${id}-erro` : undefined
  const consulta = normalizar(value)
  const estadosFiltrados = useMemo(
    () => ESTADOS_BRASILEIROS.filter(([sigla, nome]) => sigla.startsWith(consulta) || normalizar(nome).startsWith(consulta)),
    [consulta],
  )

  function selecionar(sigla: string) {
    onChange(sigla)
    definirAberto(false)
    inputRef.current?.focus()
  }

  function aoTeclar(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Escape') {
      definirAberto(false)
      return
    }
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault()
      definirAberto(true)
      const deslocamento = evento.key === 'ArrowDown' ? 1 : -1
      definirIndiceAtivo((atual) => {
        const total = estadosFiltrados.length
        return total ? (atual + deslocamento + total) % total : 0
      })
      return
    }
    if (evento.key === 'Enter' && aberto && estadosFiltrados[indiceAtivo]) {
      evento.preventDefault()
      selecionar(estadosFiltrados[indiceAtivo][0])
    }
  }

  return (
    <div
      className="campo seletor-estado"
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) definirAberto(false)
      }}
    >
      <label className="campo-rotulo" htmlFor={id}>Estado</label>
      <span className="campo-ajuda" id={idAjuda}>Digite a sigla ou escolha um estado.</span>
      <div className="seletor-estado-campo">
        <input
          ref={inputRef}
          id={id}
          name="estado"
          type="text"
          role="combobox"
          autoComplete="address-level1"
          maxLength={2}
          placeholder="Ex.: PE"
          value={value}
          aria-autocomplete="list"
          aria-expanded={aberto}
          aria-controls={idLista}
          aria-activedescendant={aberto && estadosFiltrados[indiceAtivo] ? `${id}-opcao-${estadosFiltrados[indiceAtivo][0]}` : undefined}
          aria-describedby={[idErro, idAjuda].filter(Boolean).join(' ')}
          aria-invalid={erro ? true : undefined}
          onFocus={() => definirAberto(true)}
          onKeyDown={aoTeclar}
          onChange={(evento) => {
            onChange(evento.target.value.replace(/[^a-z]/gi, '').toUpperCase().slice(0, 2))
            definirIndiceAtivo(0)
            definirAberto(true)
          }}
        />
        <button
          type="button"
          className="seletor-estado-botao"
          aria-label={aberto ? 'Fechar lista de estados' : 'Abrir lista de estados'}
          aria-expanded={aberto}
          onClick={() => {
            if (aberto) definirAberto(false)
            else {
              definirAberto(true)
              inputRef.current?.focus()
            }
          }}
        >
          <IconeSetaBaixo tamanho={18} />
        </button>
        {aberto && (
          <ul className="seletor-estado-lista" id={idLista} role="listbox" aria-label="Estados brasileiros">
            {estadosFiltrados.map(([sigla, nome], indice) => (
              <li
                className={indice === indiceAtivo ? 'seletor-estado-opcao seletor-estado-opcao-ativa' : 'seletor-estado-opcao'}
                id={`${id}-opcao-${sigla}`}
                key={sigla}
                role="option"
                aria-selected={value === sigla}
                onMouseDown={(evento) => evento.preventDefault()}
                onMouseEnter={() => definirIndiceAtivo(indice)}
                onClick={() => selecionar(sigla)}
              >
                <span className="seletor-estado-sigla">{sigla}</span>
                <span>{nome}</span>
                {value === sigla && <span className="seletor-estado-check"><IconeCheck tamanho={16} /></span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {erro && <span className="campo-erro" id={idErro} role="status">{erro}</span>}
    </div>
  )
}
