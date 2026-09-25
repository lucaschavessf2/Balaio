import Link from 'next/link'
import { IconeFechar } from '@/components/ui/Icones'
import { filtrosAtivos, hrefSem, type FiltrosListagem } from '@/utils/filtrosUrl'

export default function ChipsFiltrosAtivos({ filtros }: { filtros: FiltrosListagem }) {
  const ativos = filtrosAtivos(filtros)
  if (ativos.length === 0) return null

  return (
    <ul className="filtros-ativos" aria-label="Filtros aplicados">
      {ativos.map((filtro) => (
        <li key={filtro.chave}>
          <Link
            href={hrefSem(filtros, filtro.chave)}
            className="filtro-ativo"
            aria-label={`Remover filtro ${filtro.rotulo}: ${filtro.valor}`}
            scroll={false}
          >
            <span className="filtro-ativo-rotulo">{filtro.rotulo}:</span> {filtro.valor}
            <IconeFechar tamanho={14} />
          </Link>
        </li>
      ))}
      {ativos.length > 1 && (
        <li>
          <Link href="/search" className="botao-texto" scroll={false}>
            Limpar tudo
          </Link>
        </li>
      )}
    </ul>
  )
}
