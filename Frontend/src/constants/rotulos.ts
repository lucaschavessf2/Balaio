import type { Disponibilidade, EstadoPedido } from '@/types/dominio'

export const rotuloEstadoPedido: Record<EstadoPedido, { texto: string; classe: string }> = {
  confirmado: { texto: 'Confirmado', classe: 'selo-neutro' },
  producao: { texto: 'Em produção', classe: 'selo-encomenda' },
  enviado: { texto: 'Enviado', classe: 'selo-neutro' },
  entregue: { texto: 'Entregue', classe: 'selo-disponivel' },
}

export const rotuloDisponibilidade: Record<Disponibilidade, string> = {
  disponivel: 'Disponível',
  encomenda: 'Sob encomenda',
  unica: 'Peça única',
}
