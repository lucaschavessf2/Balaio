'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ContadorSacola from '@/components/carrinho/ContadorSacola'
import MenuPerfilMobile from '@/components/perfil/MenuPerfilMobile'
import { useTotalSacola } from '@/store/sacola'
import { itensNavegacao } from '@/components/navegacao/itensNavegacao'

const AREAS_DO_PERFIL = ['/account', '/orders', '/favorites', '/dashboard', '/admin', '/login']

function estaAtivo(caminho: string, href: string) {
  return href === '/' ? caminho === '/' : caminho === href || caminho.startsWith(`${href}/`)
}

export default function NavegacaoInferior() {
  const caminho = usePathname()
  const { total, pronto: sacolaPronta } = useTotalSacola()

  function rotuloSacola(texto: string) {
    if (!sacolaPronta || total === 0) return undefined
    return `${texto}, ${total} ${total === 1 ? 'peça' : 'peças'}`
  }

  return (
    <nav className="nav-inferior" aria-label="Navegação principal">
      {itensNavegacao.map((item) => {
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
      <MenuPerfilMobile ativo={AREAS_DO_PERFIL.some((area) => estaAtivo(caminho, area))} />
    </nav>
  )
}
