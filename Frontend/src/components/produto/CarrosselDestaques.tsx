'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Foto } from '@/components/ui/Basicos'
import { IconePlay, IconeSetaDireita, IconeSetaEsquerda } from '@/components/ui/Icones'
import ImagemComFallback from '@/components/ui/ImagemComFallback'
import MiniaturaMapa from '@/components/eventos/MiniaturaMapa'
import { fallbackDe } from '@/mocks/imagens'

export type Destaque = {
  slug: string
  nome: string
  titulo: string
  territorio: string
  resumo: string
  imagem: string
}

export type VideosDestaque = {
  capas: string[]
  total: number
}

const CAPAS_NO_MOSAICO = 4

const INTERVALO_MS = 7000
const SAIDA_MS = 220

export default function CarrosselDestaques({
  destaques,
  comEventos = false,
  videos,
  tituloPrincipal = false,
}: {
  destaques: Destaque[]
  comEventos?: boolean
  videos?: VideosDestaque
  tituloPrincipal?: boolean
}) {
  const Titulo = tituloPrincipal ? 'h1' : 'h2'
  const [indice, definirIndice] = useState(0)
  const [pausado, definirPausado] = useState(false)
  const [semMovimento, definirSemMovimento] = useState(false)
  const [saindo, definirSaindo] = useState(false)
  const trocaRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const indiceRef = useRef(indice)
  indiceRef.current = indice

  const indiceEventos = destaques.length
  const indiceVideo = indiceEventos + (comEventos ? 1 : 0)
  const totalSlides = indiceVideo + (videos ? 1 : 0)

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
  const noSlideVideo = Boolean(videos) && indice === indiceVideo
  const destaque = noSlideEventos || noSlideVideo ? null : destaques[indice]
  if (!noSlideEventos && !noSlideVideo && !destaque) return null

  const nomeSlideAtual = noSlideEventos
    ? 'Mapa de eventos perto de você'
    : noSlideVideo
      ? 'Vídeos do ateliê'
      : destaque!.nome

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
            <Titulo className="titulo-pagina">Feiras e festivais no mapa</Titulo>
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
      ) : noSlideVideo && videos ? (
        <>
          <Link href="/videos" className="hero-figura hero-figura-video" key="figura-video" tabIndex={-1}>
            <span className="hero-video-mosaico">
              {videos.capas.slice(0, CAPAS_NO_MOSAICO).map((capa, posicao) => (
                <ImagemComFallback key={`${capa}-${posicao}`} src={capa} reserva={fallbackDe(capa)} alt="" />
              ))}
            </span>
            <span className="hero-video-play">
              <IconePlay tamanho={30} />
            </span>
          </Link>
          <div className="hero-texto" key="texto-video">
            <p className="hero-kicker">
              Ateliê ao vivo · {videos.total} {videos.total === 1 ? 'vídeo' : 'vídeos'}
            </p>
            <Titulo className="titulo-pagina">O processo de perto, gravado na bancada</Titulo>
            <p className="subtitulo-pagina">
              Vídeos curtos dos artesãos mostrando como cada peça nasce: o barro no torno, a renda na almofada, a
              goiva na madeira. Assista antes de escolher a sua.
            </p>
            <div className="acoes-linha">
              <Link href="/videos" className="botao botao-primario">
                Assistir aos vídeos
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
            <Titulo className="titulo-pagina">{destaque!.titulo}</Titulo>
            <p className="subtitulo-pagina">{destaque!.resumo}</p>
            <div className="acoes-linha">
              <Link href={`/pieces/${destaque!.slug}`} className="botao botao-primario">
                Conhecer peça
                <IconeSetaDireita />
              </Link>
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
          {videos && (
            <button
              key="video"
              type="button"
              className="hero-ponto"
              aria-label={`Ver destaque ${indiceVideo + 1} de ${totalSlides}: vídeos do ateliê`}
              aria-current={indice === indiceVideo}
              onClick={() => irPara(indiceVideo)}
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
