import Pagina from '@/components/layout/Pagina'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'

export default function Carregando() {
  return (
    <Pagina>
      <EstadoCarregando rotulo="Buscando peças…" cartoes={9} />
    </Pagina>
  )
}
