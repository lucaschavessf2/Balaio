'use client'

import { useState } from 'react'
import { avisar } from '@/components/feedback/Avisos'
import { validarCEP } from '@/utils/validacao'
import { useDados } from '@/store/dados'
import { emReais } from '@/utils/formato'

export default function CalculoFrete({ territorio }: { territorio: string }) {
  const { fretes: opcoesFrete, erro: erroFretes, carregando } = useDados()
  const [cep, definirCep] = useState('')
  const [erro, definirErro] = useState<string | null>(null)
  const [calculado, definirCalculado] = useState(false)

  function calcular() {
    const problema = erroFretes ?? (opcoesFrete.length ? validarCEP(cep) : 'Nenhuma opção de entrega disponível.')
    definirErro(problema)
    if (problema) {
      definirCalculado(false)
      avisar.erro(problema)
      return
    }
    definirCalculado(true)
  }

  return (
    <div className="cartao abaixo-4">
      <p className="campo-rotulo abaixo-3">Calcular frete de origem</p>
      <div className="linha-flex">
        <label className="so-leitor" htmlFor="cep">
          CEP de entrega
        </label>
        <input
          id="cep"
          className="campo-select"
          placeholder="Digite seu CEP (ex: 50000-000)"
          style={{ flex: '1 1 180px', minHeight: 48 }}
          inputMode="numeric"
          maxLength={9}
          value={cep}
          onChange={(evento) => definirCep(evento.target.value)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? 'cep-erro' : undefined}
        />
        <button type="button" className="botao botao-secundario" disabled={carregando} onClick={calcular}>
          Calcular
        </button>
      </div>
      {erro && (
        <p className="campo-erro acima-2" id="cep-erro" role="status">
          {erro}
        </p>
      )}
      {calculado && (
        <div className="acima-3" role="status">
          {opcoesFrete.map((opcao) => (
            <p className="resumo" key={opcao.id}>
              <span>
                {opcao.nome} · {opcao.prazo}
              </span>
              <strong>{emReais(opcao.valor)}</strong>
            </p>
          ))}
        </div>
      )}
      <p className="campo-ajuda acima-3">Sai diretamente da oficina do artesão em {territorio}.</p>
    </div>
  )
}
