'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, type MouseEvent } from 'react'
import { IconeMenu, IconeSetaBaixo } from '@/components/ui/Icones'
import { gruposDepartamentos, linksRapidos } from '@/constants/departamentos'

export default function BarraDepartamentos() {
  const menu = useRef<HTMLDetailsElement>(null)
  const caminho = usePathname()
  const parametros = useSearchParams()

  useEffect(() => {
    if (menu.current) menu.current.open = false
  }, [caminho, parametros])

  useEffect(() => {
    function fecharAoClicarFora(evento: PointerEvent) {
      if (menu.current?.open && !menu.current.contains(evento.target as Node)) menu.current.open = false
    }
    function fecharComEsc(evento: KeyboardEvent) {
      if (evento.key === 'Escape' && menu.current?.open) {
        menu.current.open = false
        menu.current.querySelector('summary')?.focus()
      }
    }
    document.addEventListener('pointerdown', fecharAoClicarFora)
    document.addEventListener('keydown', fecharComEsc)
    return () => {
      document.removeEventListener('pointerdown', fecharAoClicarFora)
      document.removeEventListener('keydown', fecharComEsc)
    }
  }, [])

  function fecharAoEscolher(evento: MouseEvent<HTMLDivElement>) {
    if ((evento.target as HTMLElement).closest('a') && menu.current) menu.current.open = false
  }

  return (
    <nav className="barra-departamentos" aria-label="Departamentos">
      <div className="container barra-departamentos-linha">
        <details className="departamentos" ref={menu}>
          <summary className="departamentos-gatilho">
            <IconeMenu tamanho={18} />
            Todos os departamentos
            <IconeSetaBaixo tamanho={16} />
          </summary>
          <div className="departamentos-painel" onClick={fecharAoEscolher}>
            {gruposDepartamentos.map((grupo) => (
              <div className="departamentos-grupo" key={grupo.titulo}>
                <p className="departamentos-grupo-titulo">{grupo.titulo}</p>
                <ul>
                  {grupo.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.texto}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>

        <ul className="departamentos-rapidos">
          {linksRapidos.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.texto}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
