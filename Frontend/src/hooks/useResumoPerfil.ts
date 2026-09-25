'use client'

import { useEffect, useState } from 'react'
import { obterArtesao } from '@/services/api/artesaos.servico'
import { listarFilaCuradoria, obterMeuSelo } from '@/services/api/curadoria.servico'
import { listarConversasArtesao, listarMediacoes, listarPedidos, listarPedidosPendentes } from '@/services/api/pedidos.servico'
import type { Sessao } from '@/services/sessao/cookie'
import type { Artesao, EstadoPedido, EstadoSelo } from '@/types/dominio'

const ESTADOS_ENCERRADOS: EstadoPedido[] = ['entregue', 'recusado', 'cancelado', 'reembolsado']

export type ResumoPerfil = {
  pedidosEmAndamento?: number
  pendentes?: number
  naoLidas?: number
  artesao?: Artesao
  selo?: EstadoSelo
  filaCuradoria?: number
  mediacoes?: number
}

async function carregarResumo(sessao: Sessao): Promise<ResumoPerfil> {
  if (sessao.papel === 'artesao' && sessao.artesao) {
    const [pendentes, conversas, artesao, selo] = await Promise.all([
      listarPedidosPendentes(sessao.artesao),
      listarConversasArtesao(sessao.artesao),
      obterArtesao(sessao.artesao),
      obterMeuSelo(),
    ])
    return {
      pendentes: pendentes.dados?.length,
      naoLidas: conversas.dados?.filter((conversa) => conversa.naoLida).length,
      artesao: artesao.dados ?? undefined,
      selo: selo.dados ?? undefined,
    }
  }
  if (sessao.papel === 'admin') {
    const [fila, mediacoes] = await Promise.all([listarFilaCuradoria(), listarMediacoes()])
    return { filaCuradoria: fila.dados?.length, mediacoes: mediacoes.dados?.length }
  }
  const pedidos = await listarPedidos()
  return { pedidosEmAndamento: pedidos.dados?.filter((pedido) => !ESTADOS_ENCERRADOS.includes(pedido.estado)).length }
}

export function useResumoPerfil(sessao: Sessao | null, aberto: boolean): ResumoPerfil {
  const [resumo, definirResumo] = useState<ResumoPerfil>({})

  useEffect(() => {
    if (!sessao || !aberto) return
    let vivo = true
    carregarResumo(sessao).then((carregado) => {
      if (vivo) definirResumo(carregado)
    })
    return () => {
      vivo = false
    }
  }, [sessao, aberto])

  return sessao ? resumo : {}
}
