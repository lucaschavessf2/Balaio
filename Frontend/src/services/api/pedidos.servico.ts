import type { ConversaArtesao, Mediacao, Mensagem, Pedido, PedidoPendente } from '@/types/dominio'
import { buscar, enviar } from './cliente'
import { type RespostaApi } from './tipos'

export type Checkout = {
  itens: { slug: string; quantidade: number }[]
  freteId: string
  endereco: { cep: string; endereco: string; cidade: string; estado: string }
  meio: 'pix' | 'cartao' | 'boleto'
  compradorId: string
}

export function finalizarCompra(compra: Checkout): Promise<RespostaApi<Pedido>> {
  return enviar('/checkout', compra)
}

export function enviarMensagem(id: string, mensagem: Mensagem): Promise<RespostaApi<Mensagem>> {
  return enviar(`/pedidos/${encodeURIComponent(id)}/conversa`, mensagem)
}

export function avaliarPedido(id: string, avaliacao: { nota: number; comentario: string; aspectos: string[] }): Promise<RespostaApi<{ id: string }>> {
  return enviar(`/pedidos/${encodeURIComponent(id)}/avaliacao`, avaliacao)
}

export function criarMediacao(mediacao: Mediacao & { relato: string; solucao: string }): Promise<RespostaApi<Mediacao>> {
  return enviar('/admin/mediacoes', mediacao)
}

export async function listarPedidos(token?: string): Promise<RespostaApi<Pedido[]>> {
  return buscar<Pedido[]>('/pedidos', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
}

export async function obterPedido(id: string, token?: string): Promise<RespostaApi<Pedido>> {
  return buscar<Pedido>(`/pedidos/${encodeURIComponent(id)}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
}

export async function conversaDoPedido(id: string): Promise<RespostaApi<Mensagem[]>> {
  return buscar<Mensagem[]>(`/pedidos/${encodeURIComponent(id)}/conversa`)
}

export async function listarConversasArtesao(artesao?: string): Promise<RespostaApi<ConversaArtesao[]>> {
  return buscar<ConversaArtesao[]>(`/artesao/conversas${artesao ? `?artesao=${encodeURIComponent(artesao)}` : ''}`)
}

export async function listarPedidosPendentes(artesao?: string): Promise<RespostaApi<PedidoPendente[]>> {
  return buscar<PedidoPendente[]>(`/artesao/pedidos-pendentes${artesao ? `?artesao=${encodeURIComponent(artesao)}` : ''}`)
}

export const atualizarEstadoPedido = (id: string, estado: Pedido['estado']) => enviar<Pedido>(`/pedidos/${encodeURIComponent(id)}/estado`, { estado }, 'PATCH')

export const recusarPedido = (id: string, motivo: string) =>
  enviar<Pedido>(`/pedidos/${encodeURIComponent(id)}/recusar`, { motivo }, 'PATCH')

export const cancelarPedido = (id: string) =>
  enviar<Pedido>(`/pedidos/${encodeURIComponent(id)}/cancelar`, {}, 'PATCH')

export async function listarMediacoes(): Promise<RespostaApi<Mediacao[]>> {
  return buscar<Mediacao[]>('/admin/mediacoes')
}
