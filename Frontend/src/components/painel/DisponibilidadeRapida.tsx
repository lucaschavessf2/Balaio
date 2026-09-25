'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SeloDisponibilidade } from '@/components/ui/Basicos'
import { avisar } from '@/components/feedback/Avisos'
import { atualizarPeca } from '@/services/api/pecas.servico'
import type { Disponibilidade } from '@/types/dominio'

const opcoes: { valor: Disponibilidade; texto: string }[] = [
  { valor: 'disponivel', texto: 'Disponível' },
  { valor: 'encomenda', texto: 'Sob encomenda' },
  { valor: 'unica', texto: 'Peça única' },
]

type Props = {
  slug: string
  inicial: Disponibilidade
  prazoInicial?: number
  vendida?: boolean
}

export default function DisponibilidadeRapida({ slug, inicial, prazoInicial, vendida = false }: Props) {
  const roteador = useRouter()
  const [salva, definirSalva] = useState(inicial)
  const [selecionada, definirSelecionada] = useState(inicial)
  const [prazo, definirPrazo] = useState(String(prazoInicial ?? 15))
  const [salvando, definirSalvando] = useState(false)

  async function salvar(disponibilidade: Disponibilidade) {
    const prazoDias = Number(prazo)
    if (disponibilidade === 'encomenda' && (!Number.isInteger(prazoDias) || prazoDias < 1 || prazoDias > 120)) {
      avisar.erro('Informe um prazo entre 1 e 120 dias')
      return
    }

    definirSalvando(true)
    const resposta = await atualizarPeca(slug, {
      disponibilidade,
      ...(disponibilidade === 'encomenda' ? { prazoProducaoDias: prazoDias } : { prazoProducaoDias: undefined }),
    })
    definirSalvando(false)
    if (!resposta.dados) {
      definirSelecionada(salva)
      avisar.erro('Não foi possível mudar a disponibilidade', resposta.erro?.mensagem)
      return
    }
    definirSalva(disponibilidade)
    definirSelecionada(disponibilidade)
    avisar.sucesso('Disponibilidade atualizada')
    roteador.refresh()
  }

  if (vendida && salva === 'unica') {
    return (
      <div className="disponibilidade-rapida">
        <SeloDisponibilidade tipo="unica" />
        <span className="disponibilidade-aviso">Vendida · volta à vitrine se o pedido for cancelado.</span>
      </div>
    )
  }

  return (
    <div className="disponibilidade-rapida">
      <select
        aria-label="Condição de venda"
        value={selecionada}
        disabled={salvando}
        onChange={(evento) => {
          const proxima = evento.target.value as Disponibilidade
          definirSelecionada(proxima)
          if (proxima !== 'encomenda') void salvar(proxima)
        }}
      >
        {opcoes.map((opcao) => <option key={opcao.valor} value={opcao.valor}>{opcao.texto}</option>)}
      </select>
      {selecionada === 'encomenda' && (
        <div className="disponibilidade-prazo">
          <input
            aria-label="Prazo de produção em dias"
            type="number"
            min={1}
            max={120}
            value={prazo}
            disabled={salvando}
            onChange={(evento) => definirPrazo(evento.target.value)}
          />
          <span>dias</span>
          <button type="button" className="botao botao-fantasma" disabled={salvando} onClick={() => void salvar('encomenda')}>
            {salvando ? 'Salvando…' : salva === 'encomenda' && String(prazoInicial ?? 15) === prazo ? 'Confirmar' : 'Salvar prazo'}
          </button>
        </div>
      )}
    </div>
  )
}
