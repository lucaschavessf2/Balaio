'use client'

import Link from 'next/link'
import { Children, useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { IconeAnterior, IconeProximo, IconeSetaDireita } from '@/components/ui/Icones'

export type VariantePrateleira = 'pecas' | 'cartoes' | 'atalhos'

type Props = {
  titulo: string
  id?: string
  subtitulo?: string
  verTodos?: { href: string; texto?: string }
  extra?: ReactNode
  variante?: VariantePrateleira
  tituloVisivel?: boolean
  children: ReactNode
}

const FRACAO_ROLAGEM = 0.9

export default function Prateleira({
  titulo,
  id,
  subtitulo,
  verTodos,
  extra,
  variante = 'pecas',
  tituloVisivel = true,
  children,
}: Props) {
  const idTitulo = useId()
  const trilho = useRef<HTMLUListElement>(null)
  const [podeVoltar, definirPodeVoltar] = useState(false)
  const [podeAvancar, definirPodeAvancar] = useState(false)

  const atualizarLimites = useCallback(() => {
    const alvo = trilho.current
    if (!alvo) return
    definirPodeVoltar(alvo.scrollLeft > 4)
    definirPodeAvancar(alvo.scrollLeft + alvo.clientWidth < alvo.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const alvo = trilho.current
    if (!alvo) return
    atualizarLimites()
    alvo.addEventListener('scroll', atualizarLimites, { passive: true })
    const observador = new ResizeObserver(atualizarLimites)
    observador.observe(alvo)
    return () => {
      alvo.removeEventListener('scroll', atualizarLimites)
      observador.disconnect()
    }
  }, [atualizarLimites])

  function rolar(direcao: 1 | -1) {
    const alvo = trilho.current
    if (!alvo) return
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    alvo.scrollBy({ left: direcao * alvo.clientWidth * FRACAO_ROLAGEM, behavior: semMovimento ? 'auto' : 'smooth' })
  }

  const temRolagem = podeVoltar || podeAvancar

  return (
    <section className={`prateleira prateleira-${variante}`} id={id} aria-labelledby={idTitulo}>
      <header className={`prateleira-topo${tituloVisivel ? '' : ' so-leitor'}`}>
        <div className="prateleira-titulos">
          <h2 className="prateleira-titulo" id={idTitulo}>
            {titulo}
          </h2>
          {subtitulo && <p className="prateleira-subtitulo">{subtitulo}</p>}
        </div>
        {extra}
        {verTodos && (
          <Link href={verTodos.href} className="prateleira-ver-todos">
            {verTodos.texto ?? 'Ver todos'}
            <IconeSetaDireita tamanho={14} />
          </Link>
        )}
      </header>

      <div className="prateleira-corpo">
        {temRolagem && (
          <button
            type="button"
            className="prateleira-seta prateleira-seta-anterior"
            onClick={() => rolar(-1)}
            disabled={!podeVoltar}
            aria-label={`Anteriores: ${titulo}`}
          >
            <IconeAnterior tamanho={22} />
          </button>
        )}

        <ul className="prateleira-trilho" ref={trilho} tabIndex={0} aria-labelledby={idTitulo}>
          {Children.toArray(children).map((filho, indice) => (
            <li className="prateleira-item" key={indice}>
              {filho}
            </li>
          ))}
        </ul>

        {temRolagem && (
          <button
            type="button"
            className="prateleira-seta prateleira-seta-proxima"
            onClick={() => rolar(1)}
            disabled={!podeAvancar}
            aria-label={`Próximos: ${titulo}`}
          >
            <IconeProximo tamanho={22} />
          </button>
        )}
      </div>
    </section>
  )
}
