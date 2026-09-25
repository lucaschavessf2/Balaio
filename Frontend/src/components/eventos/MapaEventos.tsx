import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { inscrever, lerTema, type Tema } from '@/store/tema'
import type { Ponto } from '@/types/dominio'

export type PontoEvento = {
  slug: string
  nome: string
  cidade: string
  periodo: string
  lat: number
  lng: number
  proprio?: boolean
}

export type PropsMapaEventos = {
  eventos?: PontoEvento[]
  usuario?: Ponto | null
  centro?: Ponto
  zoom?: number
  comLinks?: boolean
  aoEscolher?: (ponto: Ponto) => void
  escolhido?: Ponto | null
  rotulo?: string
  estatico?: boolean
}

const atribuicao = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

const urlTiles = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

function iconePino(proprio: boolean) {
  return L.divIcon({
    className: 'pino-envoltorio',
    html: `<span class="pino-evento${proprio ? ' pino-evento-proprio' : ''}"></span>`,
    iconSize: [30, 40],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  })
}

export default function MapaEventos({
  eventos = [],
  usuario = null,
  centro,
  zoom,
  comLinks = false,
  aoEscolher,
  escolhido = null,
  rotulo,
  estatico = false,
}: PropsMapaEventos) {
  const elementoRef = useRef<HTMLDivElement>(null)
  const mapaRef = useRef<L.Map | null>(null)
  const camadaTilesRef = useRef<L.TileLayer | null>(null)
  const grupoPinosRef = useRef<L.LayerGroup | null>(null)
  const pinoEscolhidoRef = useRef<L.Marker | null>(null)
  const enquadrarRef = useRef<(() => void) | null>(null)
  const aoEscolherRef = useRef(aoEscolher)
  aoEscolherRef.current = aoEscolher
  const [dicaToque, definirDicaToque] = useState(false)

  const tema = useSyncExternalStore(inscrever, lerTema, () => 'claro' as Tema)
  const latCentro = centro?.lat
  const lngCentro = centro?.lng
  const latEscolhida = escolhido?.lat
  const lngEscolhida = escolhido?.lng

  useEffect(() => {
    const elemento = elementoRef.current
    if (!elemento || mapaRef.current) return

    const mapa = L.map(elemento, {
      center: [latCentro ?? -8.4, lngCentro ?? -36.6],
      zoom: zoom ?? 7,
      scrollWheelZoom: false,
      dragging: !estatico && !L.Browser.mobile,
      zoomControl: !estatico,
      attributionControl: !estatico,
      keyboard: !estatico,
      doubleClickZoom: !estatico,
      touchZoom: !estatico,
      boxZoom: !estatico,
    })
    mapaRef.current = mapa
    grupoPinosRef.current = L.layerGroup().addTo(mapa)
    if (!estatico && L.Browser.mobile) definirDicaToque(true)

    if (!estatico) {
      mapa.on('click', (evento) => {
        mapa.dragging.enable()
        mapa.scrollWheelZoom.enable()
        definirDicaToque(false)
        aoEscolherRef.current?.({ lat: evento.latlng.lat, lng: evento.latlng.lng })
      })
    }

    const observador = new ResizeObserver(() => {
      mapa.invalidateSize()
      enquadrarRef.current?.()
    })
    observador.observe(elemento)
    setTimeout(() => {
      mapa.invalidateSize()
      enquadrarRef.current?.()
    }, 0)

    return () => {
      observador.disconnect()
      mapa.remove()
      mapaRef.current = null
      camadaTilesRef.current = null
      grupoPinosRef.current = null
      pinoEscolhidoRef.current = null
      enquadrarRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa) return
    camadaTilesRef.current?.remove()
    camadaTilesRef.current = L.tileLayer(urlTiles, {
      attribution: atribuicao,
      maxZoom: 19,
      className: tema === 'escuro' ? 'tiles-tema-escuro' : '',
    }).addTo(mapa)
  }, [tema])

  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa || latCentro === undefined || lngCentro === undefined || !aoEscolherRef.current) return
    mapa.setView([latCentro, lngCentro], zoom ?? 13)
  }, [latCentro, lngCentro, zoom])

  useEffect(() => {
    const mapa = mapaRef.current
    const grupo = grupoPinosRef.current
    if (!mapa || !grupo) return

    grupo.clearLayers()
    const pontos: [number, number][] = []

    for (const evento of eventos) {
      const marcador = L.marker([evento.lat, evento.lng], {
        icon: iconePino(Boolean(evento.proprio)),
        title: evento.nome,
        interactive: !estatico,
        keyboard: !estatico,
      })

      if (!estatico) {
        const caixa = document.createElement('div')
        caixa.className = 'popup-evento'
        const nome = document.createElement('strong')
        nome.textContent = evento.nome
        const meta = document.createElement('span')
        meta.textContent = `${evento.cidade} · ${evento.periodo}`
        caixa.append(nome, meta)
        if (comLinks) {
          const link = document.createElement('a')
          link.href = `/events/${evento.slug}`
          link.textContent = 'Ver o evento'
          caixa.append(link)
        }
        marcador.bindPopup(caixa)
      }
      marcador.addTo(grupo)
      pontos.push([evento.lat, evento.lng])
    }

    if (usuario) {
      const iconeUsuario = L.divIcon({
        className: 'pino-envoltorio',
        html: '<span class="pino-usuario"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      })
      const marcadorUsuario = L.marker([usuario.lat, usuario.lng], {
        icon: iconeUsuario,
        title: 'Você está aqui',
        interactive: !estatico,
        keyboard: !estatico,
      })
      if (!estatico) marcadorUsuario.bindTooltip('Você está aqui')
      marcadorUsuario.addTo(grupo)
      pontos.push([usuario.lat, usuario.lng])
    }

    if (aoEscolherRef.current || pontos.length === 0) {
      enquadrarRef.current = null
      return
    }

    enquadrarRef.current = () => {
      mapa.invalidateSize({ animate: false })
      if (pontos.length === 1) {
        mapa.setView(pontos[0], zoom ?? 13, { animate: false })
      } else {
        mapa.fitBounds(L.latLngBounds(pontos), {
          paddingTopLeft: [28, 52],
          paddingBottomRight: [28, 24],
          animate: false,
        })
      }
    }
    enquadrarRef.current()
  }, [eventos, usuario, comLinks, zoom, estatico])

  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa) return
    pinoEscolhidoRef.current?.remove()
    pinoEscolhidoRef.current = null
    if (latEscolhida !== undefined && lngEscolhida !== undefined) {
      pinoEscolhidoRef.current = L.marker([latEscolhida, lngEscolhida], {
        icon: iconePino(true),
        title: 'Local do evento',
      }).addTo(mapa)
    }
  }, [latEscolhida, lngEscolhida])

  return (
    <>
      <div
        ref={elementoRef}
        className="mapa-tela"
        role="application"
        aria-label={rotulo ?? 'Mapa com os eventos de artesanato'}
      />
      {dicaToque && <span className="mapa-dica-toque">Toque para explorar o mapa</span>}
    </>
  )
}
