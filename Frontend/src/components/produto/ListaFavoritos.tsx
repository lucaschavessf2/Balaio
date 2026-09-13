'use client'

import Link from 'next/link'
import CartaoPeca from '@/components/produto/CartaoPeca'
import { EstadoVazio } from '@/components/ui/Basicos'
import { IconeCoracao } from '@/components/ui/Icones'
import { useFavoritos } from '@/store/favoritos'
import { acharPeca } from '@/mocks/pecas'

export default function ListaFavoritos() {
  const { slugs } = useFavoritos()
  const pecas = slugs.map((slug) => acharPeca(slug)).filter((p) => p !== undefined)

  if (pecas.length === 0) {
    return (
      <EstadoVazio
        icone={<IconeCoracao tamanho={34} />}
        titulo="Você ainda não salvou nenhuma peça"
        descricao="Ao navegar pelo catálogo, use o coração no canto da peça para guardá-la aqui e decidir com calma."
        acao={
          <Link href="/" className="botao botao-primario">
            Explorar o catálogo
          </Link>
        }
      />
    )
  }

  return (
    <div className="grade-pecas grade-pecas-compacta">
      {pecas.map((p) => (
        <CartaoPeca key={p.slug} peca={p} />
      ))}
    </div>
  )
}
