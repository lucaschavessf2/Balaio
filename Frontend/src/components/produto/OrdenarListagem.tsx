'use client'

import { useRouter } from 'next/navigation'
import { rotuloOrdenacao } from '@/constants/rotulos'
import type { Ordenacao } from '@/services/api/pecas.servico'
import { hrefCom, hrefListagem, ordenacoes, type FiltrosListagem } from '@/utils/filtrosUrl'

export default function OrdenarListagem({ filtros }: { filtros: FiltrosListagem }) {
  const roteador = useRouter()
  const camposMantidos = [...new URLSearchParams(hrefListagem({ ...filtros, ordenar: undefined, pagina: 1 }).split('?')[1]).entries()]

  return (
    <form method="get" action="/search" className="ordenar-listagem">
      {camposMantidos.map(([chave, valor]) => (
        <input key={chave} type="hidden" name={chave} value={valor} />
      ))}
      <label className="linha-flex" style={{ gap: 8 }}>
        Ordenar por:
        <select
          className="campo-select"
          name="ordenar"
          value={filtros.ordenar}
          onChange={(evento) =>
            roteador.push(hrefCom(filtros, { ordenar: evento.target.value as Ordenacao }), { scroll: false })
          }
        >
          {ordenacoes.map((opcao) => (
            <option key={opcao} value={opcao}>
              {rotuloOrdenacao[opcao]}
            </option>
          ))}
        </select>
      </label>
      <noscript>
        <button type="submit" className="botao botao-secundario">
          Aplicar
        </button>
      </noscript>
    </form>
  )
}
