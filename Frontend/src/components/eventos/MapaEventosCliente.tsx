import dynamic from 'next/dynamic'
import type { PropsMapaEventos } from '@/components/eventos/MapaEventos'

const MapaEventos = dynamic(() => import('./MapaEventos'), {
  ssr: false,
  loading: () => <p className="mapa-carregando">Carregando o mapa…</p>,
})

export default function MapaEventosCliente(props: PropsMapaEventos) {
  return <MapaEventos {...props} />
}
