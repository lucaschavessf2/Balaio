'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Foto } from '@/components/ui/Basicos'
import { IconeSetaDireita, IconeSetaEsquerda } from '@/components/ui/Icones'
import MiniaturaMapa from '@/components/eventos/MiniaturaMapa'
import { emReais } from '@/utils/formato'

export type Destaque = {
  slug: string
  nome: string
  titulo: string
  territorio: string
  resumo: string
  preco: number
  imagem: string
}

const INTERVALO_MS = 7000
const SAIDA_MS = 220

export default function CarrosselDestaques({
  destaques,
  comEventos = false,
}: {
  destaques: Destaque[]
  comEventos?: boolean
}) {
  const [indice, definirIndice] = useState(0)
  const [pausado, definirPausado] = useState(false)
  const [semMovimento, definirSemMovimento] = useState(false)
  const [saindo, definirSaindo] = useState(false)
  const trocaRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const indiceRef = useRef(indice)
  indiceRef.current = indice

  const totalSlides = destaques.length + (comEventos ? 1 : 0)
  const indiceEventos = destaques.length

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    definirSemMovimento(consulta.matches)
    const aoMudar = (evento: MediaQueryListEvent) => definirSemMovimento(evento.matches)
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [])

  useEffect(() => {
    return () => {
      if (trocaRef.current) clearTimeout(trocaRef.current)
    }
  }, [])

  function irPara(proximoIndice: number) {
    if (proximoIndice === indiceRef.current || trocaRef.current) return
    if (semMovimento) {
      definirIndice(proximoIndice)
      return
    }
    definirSaindo(true)
    trocaRef.current = setTimeout(() => {
      definirIndice(proximoIndice)
      definirSaindo(false)
      trocaRef.current = null
    }, SAIDA_MS)
  }

  useEffect(() => {
    if (pausado || semMovimento || totalSlides < 2) return
    const temporizador = setTimeout(() => irPara((indiceRef.current + 1) % totalSlides), INTERVALO_MS)
    return () => clearTimeout(temporizador)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, pausado, semMovimento, totalSlides])

  const noSlideEventos = comEventos && indice === indiceEventos
  const destaque = noSlideEventos ? null : destaques[indice]
  if (!noSlideEventos && !destaque) return null

  const nomeSlideAtual = noSlideEventos ? 'Mapa de eventos perto de você' : destaque!.nome

  function anterior() {
    irPara((indice - 1 + totalSlides) % totalSlides)
  }

  function proximo() {
    irPara((indice + 1) % totalSlides)
  }

  return (
    <section
      className={`hero hero-carrossel${saindo ? ' hero-carrossel-saindo' : ''}${pausado ? ' hero-carrossel-pausado' : ''}`}
      aria-roledescription="carrossel"
      aria-label="Destaques da semana"
      onMouseEnter={() => definirPausado(true)}
      onMouseLeave={() => definirPausado(false)}
      onFocus={() => definirPausado(true)}
      onBlur={() => definirPausado(false)}
    >
      {noSlideEventos ? (
        <>
          <Link href="/events" className="hero-figura hero-figura-mapa" key="figura-eventos" tabIndex={-1}>
            <span className="mapa-eventos">
              <MiniaturaMapa />
            </span>
          </Link>
          <div className="hero-texto" key="texto-eventos">
            <p className="hero-kicker">Eventos perto de você</p>
            <h1 className="titulo-pagina">Feiras e festivais no mapa</h1>
            <p className="subtitulo-pagina">
              Veja no mapa os eventos de artesanato mais próximos, como a Fenearte, e descubra quem da plataforma
              vai estar em cada um.
            </p>
            <div className="acoes-linha">
              <Link href="/events" className="botao botao-primario">
                Ver o mapa de eventos
                <IconeSetaDireita />
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="hero-figura" key={`figura-${destaque!.slug}`}>
            <Foto nome={destaque!.nome} imagem={destaque!.imagem} />
          </div>
          <div className="hero-texto" key={`texto-${destaque!.slug}`}>
            <p className="hero-kicker">Destaque da semana · {destaque!.territorio}</p>
            <h1 className="titulo-pagina">{destaque!.titulo}</h1>
            <p className="subtitulo-pagina">{destaque!.resumo}</p>
            <div className="acoes-linha">
              <Link href={`/pieces/${destaque!.slug}`} className="botao botao-primario">
                Conhecer peça
                <IconeSetaDireita />
              </Link>
              <span className="preco preco-destaque">{emReais(destaque!.preco)}</span>
            </div>
          </div>
        </>
      )}

      <div className="hero-controles">
        <button type="button" className="hero-seta" onClick={anterior} aria-label="Destaque anterior">
          <IconeSetaEsquerda tamanho={18} />
        </button>
        <div className="hero-pontos">
          {destaques.map((d, i) => (
            <button
              key={d.slug}
              type="button"
              className="hero-ponto"
              aria-label={`Ver destaque ${i + 1} de ${totalSlides}: ${d.nome}`}
              aria-current={i === indice}
              onClick={() => irPara(i)}
            />
          ))}
          {comEventos && (
            <button
              key="eventos"
              type="button"
              className="hero-ponto"
              aria-label={`Ver destaque ${indiceEventos + 1} de ${totalSlides}: mapa de eventos perto de você`}
              aria-current={indice === indiceEventos}
              onClick={() => irPara(indiceEventos)}
            />
          )}
        </div>
        <button type="button" className="hero-seta" onClick={proximo} aria-label="Próximo destaque">
          <IconeSetaDireita tamanho={18} />
        </button>
        <span className="so-leitor" aria-live="polite">
          Destaque {indice + 1} de {totalSlides}: {nomeSlideAtual}
        </span>
      </div>
    </section>
  )
}
