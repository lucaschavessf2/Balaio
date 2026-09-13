import LayoutPainel from '@/components/painel/LayoutPainel'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'

export default function Carregando() {
  return (
    <LayoutPainel ativo="pedidos">
      <EstadoCarregando rotulo="Carregando o painel…" cartoes={3} />
    </LayoutPainel>
  )
}
