import type { Disponibilidade, EstadoPedido } from '@/types/dominio'
import type { Ordenacao } from '@/services/api/pecas.servico'

export const rotuloEstadoPedido: Record<EstadoPedido, { texto: string; classe: string }> = {
  aguardando_reserva: { texto: 'Confirmando disponibilidade', classe: 'selo-neutro' },
  aguardando_pagamento: { texto: 'Aguardando pagamento', classe: 'selo-neutro' },
  confirmacao_pendente: { texto: 'Confirmando pagamento', classe: 'selo-neutro' },
  confirmado: { texto: 'Confirmado', classe: 'selo-neutro' },
  producao: { texto: 'Em produção', classe: 'selo-encomenda' },
  enviado: { texto: 'Enviado', classe: 'selo-neutro' },
  entregue: { texto: 'Entregue', classe: 'selo-disponivel' },
  encerramento_pendente: { texto: 'Encerramento em processamento', classe: 'selo-neutro' },
    cancelamento_pendente: { texto: 'Cancelamento em processamento', classe: 'selo-neutro' },
    reembolso_pendente: { texto: 'Reembolso em processamento', classe: 'selo-neutro' },
  falha_reserva: { texto: 'Reserva não concluída', classe: 'selo-unica' },
  falha_pagamento: { texto: 'Pagamento não confirmado', classe: 'selo-unica' },
  recusado: { texto: 'Recusado pelo artesão', classe: 'selo-unica' },
  cancelado: { texto: 'Cancelado', classe: 'selo-unica' },
  reembolsado: { texto: 'Reembolsado', classe: 'selo-disponivel' },
}

export const rotuloDisponibilidade: Record<Disponibilidade, string> = {
  disponivel: 'Disponível',
  encomenda: 'Sob encomenda',
  unica: 'Peça única',
}

export const rotuloOrdenacao: Record<Ordenacao, string> = {
  recentes: 'Mais recentes',
  'preco-asc': 'Menor preço',
  'preco-desc': 'Maior preço',
  avaliacao: 'Mais bem avaliadas',
}
