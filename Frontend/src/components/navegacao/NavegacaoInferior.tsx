'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ContadorSacola from '@/components/carrinho/ContadorSacola'
import ContadorFavoritos from '@/components/favoritos/ContadorFavoritos'
import { useTotalSacola } from '@/store/sacola'
import { useFavoritos } from '@/store/favoritos'
import { itensNavegacao } from '@/components/navegacao/itensNavegacao'
import { useSessao } from '@/store/sessao'

function estaAtivo(caminho: string, href: string) {
  return href === '/' ? caminho === '/' : caminho === href || caminho.startsWith(`${href}/`)
}

export default function NavegacaoInferior() {
  const caminho = usePathname()
  const { sessao } = useSessao()
  const { total, pronto: sacolaPronta } = useTotalSacola()
  const { slugs, pronto: favoritosProntos } = useFavoritos()

  function rotuloSacola(texto: string) {
    if (!sacolaPronta || total === 0) return undefined
    return `${texto}, ${total} ${total === 1 ? 'peça' : 'peças'}`
  }

  function rotuloFavoritos(texto: string) {
    if (!favoritosProntos || slugs.length === 0) return undefined
    return `${texto}, ${slugs.length} ${slugs.length === 1 ? 'peça' : 'peças'}`
  }

  return (
    <nav className="nav-inferior" aria-label="Navegação principal">
      {itensNavegacao(sessao).map((item) => {
        const ativo = estaAtivo(caminho, item.href)
        return (
          <Link
            key={item.chave}
            href={item.href}
            className="nav-inferior-item"
            aria-current={ativo ? 'page' : undefined}
            aria-label={
              item.mostraContadorSacola
                ? rotuloSacola(item.texto)
                : item.mostraContadorFavoritos
                  ? rotuloFavoritos(item.texto)
                  : undefined
            }
          >
            <span className="nav-inferior-icone">
              {item.icone}
              {item.mostraContadorSacola && <ContadorSacola esconderZero decorativo />}
              {item.mostraContadorFavoritos && <ContadorFavoritos esconderZero decorativo />}
            </span>
            <span className="nav-inferior-texto">{item.texto}</span>
          </Link>
        )
      })}
    </nav>
  )
}
