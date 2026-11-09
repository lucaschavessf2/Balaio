'use client'

import { useEffect, useState } from 'react'
import { obterPedido } from '@/services/api/pedidos.servico'
import type { Pedido } from '@/types/dominio'

const finais = new Set(['confirmado', 'producao', 'enviado', 'entregue', 'falha_pagamento',
  'falha_reserva', 'cancelado', 'recusado', 'reembolsado'])

function mensagem(pedido: Pedido): string {
  if (['confirmado', 'producao', 'enviado', 'entregue'].includes(pedido.estado)) return 'Pagamento confirmado pelo provedor de teste.'
  if (pedido.estado === 'reembolsado') return 'Reembolso confirmado pelo provedor de teste.'
  if (pedido.estado === 'reembolso_pendente') return 'Reembolso solicitado; aguardando confirmação do provedor.'
  if (pedido.estado === 'cancelamento_pendente') return 'Cancelamento solicitado; aguardando confirmação do provedor.'
  if (['falha_pagamento', 'falha_reserva', 'cancelado', 'recusado'].includes(pedido.estado)) return 'Este pedido foi encerrado. Consulte os detalhes do pedido.'
  return 'Aguardando confirmação do pagamento pelo Mercado Pago. O retorno ao site não confirma a cobrança.'
}

export default function EstadoPagamento({ inicial }: { inicial: Pedido }) {
  const [pedido, definirPedido] = useState(inicial)

  useEffect(() => {
    if (finais.has(pedido.estado)) return
    let ativo = true
    const inicio = Date.now()
    const temporizador = window.setInterval(async () => {
      if (Date.now() - inicio > 5 * 60_000) { window.clearInterval(temporizador); return }
      const resposta = await obterPedido(pedido.id)
      if (ativo && resposta.dados) definirPedido(resposta.dados)
    }, 8000)
    return () => { ativo = false; window.clearInterval(temporizador) }
  }, [pedido.id, pedido.estado])

  return <p role="status" className="texto-suave">{mensagem(pedido)}</p>
}
