'use client'

import Link from 'next/link'
import CartaoPeca from '@/components/produto/CartaoPeca'
import { EstadoVazio } from '@/components/ui/Basicos'
import { IconeCoracao } from '@/components/ui/Icones'
import { useFavoritos } from '@/store/favoritos'
import { usePecas } from '@/hooks/usePecas'
import EstadoErro from '@/components/feedback/EstadoErro'
import EstadoCarregando from '@/components/feedback/EstadoCarregando'

export default function ListaFavoritos() {
  const { mapaPecas, carregando, erro } = usePecas()
  const { slugs } = useFavoritos()
  const pecas = slugs.map((slug) => mapaPecas.get(slug)).filter((p) => p !== undefined)

  if (carregando) return <EstadoCarregando />
  if (erro) return <EstadoErro mensagem={erro} />

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
