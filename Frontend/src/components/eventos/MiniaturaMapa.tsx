import MapaEventosCliente from '@/components/eventos/MapaEventosCliente'
import { useEventosProximos } from '@/hooks/useEventosProximos'

export default function MiniaturaMapa() {
  const { pontos, posicao, origem } = useEventosProximos()

  return (
    <MapaEventosCliente
      eventos={pontos}
      usuario={origem === 'navegador' ? posicao : null}
      estatico
      rotulo="Prévia do mapa com os eventos de artesanato"
    />
  )
}
