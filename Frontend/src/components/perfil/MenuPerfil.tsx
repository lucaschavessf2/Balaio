'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import ConteudoMenuPerfil from '@/components/perfil/ConteudoMenuPerfil'
import { IconeSetaBaixo, IconeUsuario } from '@/components/ui/Icones'
import { useResumoPerfil } from '@/hooks/useResumoPerfil'
import { useSessao } from '@/store/sessao'
import { nomeCurto } from '@/utils/nome'

export default function MenuPerfil() {
  const { sessao } = useSessao()
  const [aberto, definirAberto] = useState(false)
  const resumo = useResumoPerfil(sessao, aberto)
  const area = useRef<HTMLDivElement>(null)
  const gatilho = useRef<HTMLButtonElement>(null)
  const idPainel = useId()
  const idTitulo = useId()
  const rotulo = sessao ? nomeCurto(sessao.nome) : 'Entrar'

  useEffect(() => {
    if (!aberto) return
    function fecharSeClicarFora(evento: PointerEvent) {
      if (!area.current?.contains(evento.target as Node)) definirAberto(false)
    }
    document.addEventListener('pointerdown', fecharSeClicarFora)
    return () => document.removeEventListener('pointerdown', fecharSeClicarFora)
  }, [aberto])

  function fecharComEsc(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key !== 'Escape' || !aberto) return
    definirAberto(false)
    gatilho.current?.focus()
  }

  function fecharAoEscolher(evento: MouseEvent<HTMLDivElement>) {
    if ((evento.target as HTMLElement).closest('a, button')) definirAberto(false)
  }

  return (
    <div className="menu-perfil" ref={area} onKeyDown={fecharComEsc}>
      <button
        ref={gatilho}
        type="button"
        className="cabecalho-link menu-perfil-gatilho"
        aria-expanded={aberto}
        aria-controls={idPainel}
        title={sessao ? `Conectado como ${sessao.nome}` : 'Entrar ou criar conta'}
        onClick={() => definirAberto((atual) => !atual)}
      >
        <IconeUsuario />
        <span className="rotulo-acao menu-perfil-rotulo">{rotulo}</span>
        <IconeSetaBaixo tamanho={14} />
      </button>

      {aberto && (
        <div id={idPainel} className="menu-perfil-painel" role="region" aria-labelledby={idTitulo} onClick={fecharAoEscolher}>
          <ConteudoMenuPerfil sessao={sessao} resumo={resumo} idTitulo={idTitulo} />
        </div>
      )}
    </div>
  )
}
