'use client'

import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { IconeFechar, IconeMenu } from '@/components/ui/Icones'

type Props = { titulo: string; rotulo?: string; children: ReactNode }

export default function MenuDrawer({ titulo, rotulo, children }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const telaLarga = window.matchMedia('(min-width: 1000px)')
    function fecharSeVirarDesktop(evento: MediaQueryListEvent) {
      if (evento.matches) dialogo.current?.close()
    }
    telaLarga.addEventListener('change', fecharSeVirarDesktop)
    return () => telaLarga.removeEventListener('change', fecharSeVirarDesktop)
  }, [])

  function cliqueFora(evento: MouseEvent<HTMLDialogElement>) {
    const alvo = dialogo.current
    if (!alvo || !alvo.open) return
    const area = alvo.getBoundingClientRect()
    const foraDoPainel =
      evento.clientX < area.left ||
      evento.clientX > area.right ||
      evento.clientY < area.top ||
      evento.clientY > area.bottom
    if (foraDoPainel) alvo.close()
  }

  function fecharAoNavegar(evento: MouseEvent<HTMLDivElement>) {
    if ((evento.target as HTMLElement).closest('a')) dialogo.current?.close()
  }

  return (
    <>
      <button type="button" className="abre-menu" onClick={() => dialogo.current?.showModal()}>
        <IconeMenu tamanho={20} />
        {rotulo ?? titulo}
      </button>

      <dialog className="drawer" ref={dialogo} aria-label={titulo} onClick={cliqueFora}>
        <div className="drawer-cabecalho">
          <p className="drawer-titulo">{titulo}</p>
          <button
            type="button"
            className="drawer-fechar"
            onClick={() => dialogo.current?.close()}
            aria-label="Fechar menu"
          >
            <IconeFechar tamanho={20} />
          </button>
        </div>
        <div className="drawer-conteudo" onClick={fecharAoNavegar}>
          {children}
        </div>
      </dialog>
    </>
  )
}
