import Pagina from '@/components/layout/Pagina'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'

export default function Carregando() {
  return (
    <Pagina>
      <EstadoCarregando rotulo="Carregando a peça…" cartoes={2} />
    </Pagina>
  )
}
