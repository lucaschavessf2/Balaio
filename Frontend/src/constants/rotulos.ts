import type { Disponibilidade, EstadoPedido } from '@/types/dominio'
import type { Ordenacao } from '@/services/api/pecas.servico'

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

export const rotuloOrdenacao: Record<Ordenacao, string> = {
  recentes: 'Mais recentes',
  'preco-asc': 'Menor preço',
  'preco-desc': 'Maior preço',
  avaliacao: 'Mais bem avaliadas',
}
