'use client'

import { useRouter } from 'next/navigation'
import Seletor from '@/components/ui/Seletor'
import { rotuloOrdenacao } from '@/constants/rotulos'
import type { Ordenacao } from '@/services/api/pecas.servico'
import { hrefCom, ordenacoes, type FiltrosListagem } from '@/utils/filtrosUrl'

const opcoesOrdenacao = ordenacoes.map((opcao) => ({ valor: opcao, rotulo: rotuloOrdenacao[opcao] }))

export default function OrdenarListagem({ filtros }: { filtros: FiltrosListagem }) {
  const roteador = useRouter()

  return (
    <div className="ordenar-listagem">
      <span id="ordenar-listagem-rotulo">Ordenar por:</span>
      <Seletor
        compacto
        className="seletor-ordenacao"
        aria-labelledby="ordenar-listagem-rotulo"
        opcoes={opcoesOrdenacao}
        value={filtros.ordenar}
        onChange={(valor) => roteador.push(hrefCom(filtros, { ordenar: valor as Ordenacao }), { scroll: false })}
      />
    </div>
  )
}
