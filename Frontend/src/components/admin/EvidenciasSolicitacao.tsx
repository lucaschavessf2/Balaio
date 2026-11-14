import Link from 'next/link'
import type { ReactNode } from 'react'
import type { SolicitacaoComEvidencias } from '@/components/admin/montarFilaCuradoria'
import { Foto } from '@/components/ui/Basicos'
import { IconeAviso, IconeCheck, IconeFechar } from '@/components/ui/Icones'

const LIMITE_MINIATURAS = 4

type SituacaoCriterio = 'ok' | 'conferir' | 'falta'

const iconePorSituacao: Record<SituacaoCriterio, ReactNode> = {
  ok: <IconeCheck tamanho={15} />,
  conferir: <IconeAviso tamanho={15} />,
  falta: <IconeFechar tamanho={15} />,
}

function conferirCriterios({ tecnica, territorio, pecas, coletivo }: SolicitacaoComEvidencias) {
  const comFoto = pecas.filter((peca) => peca.imagem).length

  const identificacao = tecnica && territorio
    ? { situacao: 'ok' as const, texto: 'Técnica e território informados' }
    : { situacao: 'falta' as const, texto: 'Técnica ou território não informados' }

  const fotos = pecas.length === 0
    ? { situacao: 'falta' as const, texto: 'Nenhuma peça publicada' }
    : comFoto === pecas.length
      ? { situacao: 'ok' as const, texto: 'Todas as peças com foto' }
      : { situacao: 'conferir' as const, texto: `${comFoto} de ${pecas.length} peças com foto` }

  const vinculo = coletivo
    ? { situacao: 'ok' as const, texto: `Participa de ${coletivo}` }
    : { situacao: 'conferir' as const, texto: 'Vínculo com associação: conferir' }

  return [identificacao, fotos, vinculo]
}

export default function EvidenciasSolicitacao({ item }: { item: SolicitacaoComEvidencias }) {
  const miniaturas = item.pecas.slice(0, LIMITE_MINIATURAS)
  const restantes = item.pecas.length - miniaturas.length

  return (
    <div className="evidencias-selo">
      {item.pecas.length > 0 && (
        <div>
          <p className="dado-rotulo abaixo-2">Peças publicadas ({item.pecas.length})</p>
          <div className="miniaturas-selo">
            {miniaturas.map((peca) => (
              <Link
                key={peca.slug}
                href={`/pieces/${peca.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="miniatura-selo"
                title={peca.nome}
                aria-label={`${peca.nome} (abre em nova aba)`}
              >
                <Foto nome={peca.nome} imagem={peca.imagem} decorativa />
              </Link>
            ))}
            {restantes > 0 && <span className="miniatura-selo miniatura-selo-mais">+{restantes}</span>}
          </div>
        </div>
      )}

      <div>
        <p className="dado-rotulo abaixo-2">Critérios</p>
        <ul className="lista-criterios">
          {conferirCriterios(item).map(({ situacao, texto }) => (
            <li key={texto} className={`criterio-${situacao}`}>
              {iconePorSituacao[situacao]}
              <span>{texto}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
