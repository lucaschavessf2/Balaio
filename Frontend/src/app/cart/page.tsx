import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import ItensSacola from '@/components/carrinho/ItensSacola'

export default function Sacola() {
  return (
    <Pagina>
      <Migalhas trilha={[{ texto: 'Início', href: '/' }, { texto: 'Sacola' }]} />
      <h1 className="titulo-pagina">Sua sacola</h1>
      <ItensSacola />
    </Pagina>
  )
}
