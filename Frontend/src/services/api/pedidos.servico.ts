import {
  pedidos,
  acharPedido,
  conversa,
  conversasArtesao,
  pedidosPendentesArtesao,
  filaCuradoria,
  mediacoes,
} from '@/mocks/pedidos'
import type { Mediacao, Mensagem, Pedido } from '@/types/dominio'
import { API_FAKE, buscar } from './cliente'
import { falha, sucesso, type RespostaApi } from './tipos'

type ConversaArtesao = (typeof conversasArtesao)[number]
type PedidoPendente = (typeof pedidosPendentesArtesao)[number]
type ItemCuradoria = (typeof filaCuradoria)[number]

export async function listarPedidos(): Promise<RespostaApi<Pedido[]>> {
  if (!API_FAKE) return buscar<Pedido[]>('/pedidos')
  return sucesso(pedidos)
}

export async function obterPedido(id: string): Promise<RespostaApi<Pedido>> {
  if (!API_FAKE) return buscar<Pedido>(`/pedidos/${id}`)
  const pedido = acharPedido(id)
  return pedido ? sucesso(pedido) : falha('RECURSO_NAO_ENCONTRADO', 'Pedido não encontrado.')
}

export async function conversaDoPedido(id: string): Promise<RespostaApi<Mensagem[]>> {
  if (!API_FAKE) return buscar<Mensagem[]>(`/pedidos/${id}/conversa`)
  return sucesso(conversa)
}

export async function listarConversasArtesao(): Promise<RespostaApi<ConversaArtesao[]>> {
  if (!API_FAKE) return buscar<ConversaArtesao[]>('/artesao/conversas')
  return sucesso(conversasArtesao)
}

export async function listarPedidosPendentes(): Promise<RespostaApi<PedidoPendente[]>> {
  if (!API_FAKE) return buscar<PedidoPendente[]>('/artesao/pedidos-pendentes')
  return sucesso(pedidosPendentesArtesao)
}

export async function listarFilaCuradoria(): Promise<RespostaApi<ItemCuradoria[]>> {
  if (!API_FAKE) return buscar<ItemCuradoria[]>('/admin/curadoria')
  return sucesso(filaCuradoria)
}

export async function listarMediacoes(): Promise<RespostaApi<Mediacao[]>> {
  if (!API_FAKE) return buscar<Mediacao[]>('/admin/mediacoes')
  return sucesso(mediacoes)
}
