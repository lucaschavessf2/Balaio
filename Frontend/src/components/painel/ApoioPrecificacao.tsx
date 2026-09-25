'use client'

import { useState } from 'react'
import { Campo } from '@/components/ui/Basicos'
import { emReais } from '@/utils/formato'
import { numeroDoPreco } from '@/utils/validacao'

type Props = { aoUsarPreco: (valor: number) => void; desabilitado?: boolean }

function positivoOuZero(valor: number): number {
  return Number.isFinite(valor) && valor > 0 ? valor : 0
}

export default function ApoioPrecificacao({ aoUsarPreco, desabilitado = false }: Props) {
  const [materiais, definirMateriais] = useState('')
  const [horas, definirHoras] = useState('')
  const [valorHora, definirValorHora] = useState('')

  const custoMateriais = positivoOuZero(numeroDoPreco(materiais))
  const horasTrabalho = positivoOuZero(Number(horas.replace(',', '.')))
  const custoHora = positivoOuZero(numeroDoPreco(valorHora))
  const custoTrabalho = horasTrabalho * custoHora
  const precoSugerido = Math.round((custoMateriais + custoTrabalho) * 100) / 100

  return (
    <div className="cartao abaixo-4">
      <h2 className="secao-titulo">Apoio à precificação</h2>
      <p className="campo-ajuda abaixo-3">
        Uma conta simples para você não vender abaixo do que o trabalho vale.
      </p>

      <Campo rotulo="Materiais (R$)" id="preco-materiais">
        <input
          id="preco-materiais"
          inputMode="decimal"
          placeholder="180,00"
          value={materiais}
          onChange={(evento) => definirMateriais(evento.target.value.replace(/[^\d,.]/g, ''))}
        />
      </Campo>
      <div className="grade-dois">
        <Campo rotulo="Horas de trabalho" id="preco-horas">
          <input
            id="preco-horas"
            inputMode="decimal"
            placeholder="14"
            value={horas}
            onChange={(evento) => definirHoras(evento.target.value.replace(/[^\d,.]/g, ''))}
          />
        </Campo>
        <Campo rotulo="Valor da hora (R$)" id="preco-valor-hora">
          <input
            id="preco-valor-hora"
            inputMode="decimal"
            placeholder="22,00"
            value={valorHora}
            onChange={(evento) => definirValorHora(evento.target.value.replace(/[^\d,.]/g, ''))}
          />
        </Campo>
      </div>

      <p className="resumo">
        <span>Materiais</span>
        <strong>{emReais(custoMateriais)}</strong>
      </p>
      <p className="resumo">
        <span>
          {horasTrabalho}h de trabalho × {emReais(custoHora)}
        </span>
        <strong>{emReais(custoTrabalho)}</strong>
      </p>
      <p className="resumo resumo-total" aria-live="polite">
        <span>Preço sugerido</span>
        <span className="preco-destaque">{emReais(precoSugerido)}</span>
      </p>

      <button
        type="button"
        className="botao botao-secundario acima-3"
        disabled={desabilitado || precoSugerido <= 0}
        onClick={() => aoUsarPreco(precoSugerido)}
      >
        Usar este preço
      </button>
      <p className="campo-ajuda acima-3">Sugestão, não regra. Você decide o preço final.</p>
    </div>
  )
}
