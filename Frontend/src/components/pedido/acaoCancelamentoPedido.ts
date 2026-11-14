import type { EstadoPedido } from '@/types/dominio'

export function acaoCancelamentoPedido(estado: EstadoPedido): 'direto' | 'mediacao' | 'pendente' | 'encerrado' {
  if (['aguardando_reserva', 'aguardando_pagamento', 'confirmado'].includes(estado)) return 'direto'
  if (['confirmacao_pendente', 'encerramento_pendente'].includes(estado)) return 'pendente'
  if (['producao', 'enviado', 'entregue'].includes(estado)) return 'mediacao'
  return 'encerrado'
}
