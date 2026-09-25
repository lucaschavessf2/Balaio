'use client'

import MapaEventosCliente from '@/components/eventos/MapaEventosCliente'
import type { PontoEvento } from '@/components/eventos/MapaEventos'

export default function MapaEventosVitrine({ pontos }: { pontos: PontoEvento[] }) {
  return (
    <div className="mapa-eventos mapa-eventos-destaque">
      <MapaEventosCliente eventos={pontos} comLinks rotulo="Mapa com as feiras e eventos de artesanato" />
    </div>
  )
}
