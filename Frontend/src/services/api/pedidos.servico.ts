import type { conversasArtesao, pedidosPendentesArtesao, filaCuradoria } from '@/mocks/pedidos'
import type { Mediacao, Mensagem, Pedido } from '@/types/dominio'
import { buscar, enviar } from './cliente'
import { type RespostaApi } from './tipos'

type ConversaArtesao = (typeof conversasArtesao)[number]
type PedidoPendente = (typeof pedidosPendentesArtesao)[number]
type ItemCuradoria = (typeof filaCuradoria)[number]

export type Checkout = {
  itens: { slug: string; quantidade: number }[]
  freteId: string
  endereco: { cep: string; endereco: string; cidade: string; estado: string }
  meio: 'pix' | 'cartao' | 'boleto'
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

export async function listarPedidos(): Promise<RespostaApi<Pedido[]>> {
  return buscar<Pedido[]>('/pedidos')
}

export async function obterPedido(id: string): Promise<RespostaApi<Pedido>> {
  return buscar<Pedido>(`/pedidos/${encodeURIComponent(id)}`)
}

export async function conversaDoPedido(id: string): Promise<RespostaApi<Mensagem[]>> {
  return buscar<Mensagem[]>(`/pedidos/${encodeURIComponent(id)}/conversa`)
}

export async function listarConversasArtesao(): Promise<RespostaApi<ConversaArtesao[]>> {
  return buscar<ConversaArtesao[]>('/artesao/conversas')
}

export async function listarPedidosPendentes(): Promise<RespostaApi<PedidoPendente[]>> {
  return buscar<PedidoPendente[]>('/artesao/pedidos-pendentes')
}

export async function listarFilaCuradoria(): Promise<RespostaApi<ItemCuradoria[]>> {
  return buscar<ItemCuradoria[]>('/admin/curadoria')
}

export async function listarMediacoes(): Promise<RespostaApi<Mediacao[]>> {
  return buscar<Mediacao[]>('/admin/mediacoes')
}
