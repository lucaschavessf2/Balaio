import Pagina from '@/components/layout/Pagina'
import CheckoutFormulario from '@/components/carrinho/CheckoutFormulario'

export const metadata = {
  title: 'Revisão da compra | Balaio',
  description: 'Confira as peças, a entrega, o frete e o total antes de confirmar sua compra no Balaio.',
}

export default function Checkout() {
  return <Pagina><CheckoutFormulario /></Pagina>
}
