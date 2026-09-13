import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import ListaFavoritos from '@/components/produto/ListaFavoritos'

export default function Favoritos() {
  return (
    <Pagina>
      <Migalhas trilha={[{ texto: 'Início', href: '/' }, { texto: 'Peças salvas' }]} />

      <h1 className="titulo-pagina">Peças salvas</h1>
      <p className="subtitulo-pagina">
        O que você guardou para decidir depois. Peças únicas podem sair do catálogo se outra pessoa comprar antes.
      </p>

      <ListaFavoritos />
    </Pagina>
  )
}
