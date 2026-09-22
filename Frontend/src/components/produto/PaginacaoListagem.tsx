import Link from 'next/link'
import type { Paginacao } from '@/services/api/tipos'
import { hrefListagem, type FiltrosListagem } from '@/utils/filtrosUrl'

export default function PaginacaoListagem({ filtros, paginacao }: { filtros: FiltrosListagem; paginacao: Paginacao }) {
  if (paginacao.totalPaginas <= 1) return null
  const { pagina, totalPaginas } = paginacao
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1)
  const href = (numero: number) => hrefListagem({ ...filtros, pagina: numero })

  return (
    <nav className="paginacao" aria-label="Páginas do catálogo">
      {pagina > 1 ? (
        <Link href={href(pagina - 1)} className="botao botao-fantasma">
          ← Anterior
        </Link>
      ) : (
        <span className="botao botao-fantasma" aria-disabled="true">
          ← Anterior
        </span>
      )}
      {paginas.map((numero) => (
        <Link
          key={numero}
          href={href(numero)}
          className={`pagina-numero${numero === pagina ? ' pagina-numero-ativa' : ''}`}
          aria-current={numero === pagina ? 'page' : undefined}
          aria-label={`Página ${numero}`}
        >
          {numero}
        </Link>
      ))}
      {pagina < totalPaginas ? (
        <Link href={href(pagina + 1)} className="botao botao-fantasma">
          Próxima →
        </Link>
      ) : (
        <span className="botao botao-fantasma" aria-disabled="true">
          Próxima →
        </span>
      )}
    </nav>
  )
}
