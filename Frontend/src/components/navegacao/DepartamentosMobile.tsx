import Link from 'next/link'
import { gruposDepartamentos, linksRapidos } from '@/constants/departamentos'

const [tiposDePeca] = gruposDepartamentos

export default function DepartamentosMobile() {
  const links = [linksRapidos[0], ...tiposDePeca.links, ...linksRapidos.slice(1)]

  return (
    <nav className="departamentos-mobile" aria-label="Departamentos">
      <ul className="departamentos-mobile-lista">
        <li>
          <Link href="/search" className="departamentos-mobile-chip departamentos-mobile-chip-todos">
            Tudo
          </Link>
        </li>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="departamentos-mobile-chip">
              {link.texto}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
