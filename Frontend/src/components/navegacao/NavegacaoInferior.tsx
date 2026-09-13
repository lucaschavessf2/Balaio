'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ContadorSacola from '@/components/carrinho/ContadorSacola'
import { useTotalSacola } from '@/store/sacola'
import { itensNavegacao } from '@/components/navegacao/itensNavegacao'

function estaAtivo(caminho: string, href: string) {
  return href === '/' ? caminho === '/' : caminho === href || caminho.startsWith(`${href}/`)
}

export default function NavegacaoInferior({ comoArtesao = false }: { comoArtesao?: boolean }) {
  const caminho = usePathname()
  const { total, pronto } = useTotalSacola()

  function rotuloSacola(texto: string) {
    if (!pronto || total === 0) return undefined
    return `${texto}, ${total} ${total === 1 ? 'peça' : 'peças'}`
  }

  return (
    <nav className="nav-inferior" aria-label="Navegação principal">
      {itensNavegacao(comoArtesao).map((item) => {
        const ativo = estaAtivo(caminho, item.href)
        return (
          <Link
            key={item.chave}
            href={item.href}
            className="nav-inferior-item"
            aria-current={ativo ? 'page' : undefined}
            aria-label={item.mostraContadorSacola ? rotuloSacola(item.texto) : undefined}
          >
            <span className="nav-inferior-icone">
              {item.icone}
              {item.mostraContadorSacola && <ContadorSacola esconderZero decorativo />}
            </span>
            <span className="nav-inferior-texto">{item.texto}</span>
          </Link>
        )
      })}
    </nav>
  )
}
