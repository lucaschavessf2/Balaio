import assert from 'node:assert/strict'
import { test } from 'node:test'
import { acaoCancelamentoPedido } from './acaoCancelamentoPedido'

test('pedido antes da produção oferece cancelamento direto', () => {
  for (const estado of ['aguardando_reserva', 'aguardando_pagamento', 'confirmado'] as const) {
    assert.equal(acaoCancelamentoPedido(estado), 'direto')
  }
})

test('operações pendentes não afirmam início de produção', () => {
  for (const estado of ['confirmacao_pendente', 'encerramento_pendente'] as const) {
    assert.equal(acaoCancelamentoPedido(estado), 'pendente')
  }
})

test('produção direciona à mediação; pedidos encerrados não oferecem novo cancelamento', () => {
  for (const estado of ['producao', 'enviado', 'entregue'] as const) {
    assert.equal(acaoCancelamentoPedido(estado), 'mediacao')
  }
  for (const estado of ['falha_reserva', 'falha_pagamento', 'recusado', 'cancelado', 'reembolsado'] as const) {
    assert.equal(acaoCancelamentoPedido(estado), 'encerrado')
  }
})
