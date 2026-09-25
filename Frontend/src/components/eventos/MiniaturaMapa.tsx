import EstadoErro from '@/components/feedback/EstadoErro'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'
import MapaEventosCliente from '@/components/eventos/MapaEventosCliente'
import { useEventosProximos } from '@/hooks/useEventosProximos'

export default function MiniaturaMapa() {
  const { pontos, posicao, origem, carregando, erro } = useEventosProximos()

  if (carregando) return <EstadoCarregando />
  if (erro) return <EstadoErro mensagem={erro} />

  return (
    <MapaEventosCliente
      eventos={pontos}
      usuario={origem === 'navegador' ? posicao : null}
      estatico
      rotulo="Prévia do mapa com os eventos de artesanato"
    />
  )
}
